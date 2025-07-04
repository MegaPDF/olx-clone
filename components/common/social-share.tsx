"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageCircle,
  Copy,
  Link,
  MoreHorizontal,
  Check,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SocialShareProps {
  url: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  variant?: "button" | "dropdown" | "modal" | "inline";
  size?: "sm" | "md" | "lg";
  platforms?: SocialPlatform[];
  showCopyLink?: boolean;
  showNativeShare?: boolean;
  className?: string;
  children?: React.ReactNode;
}

type SocialPlatform =
  | "facebook"
  | "twitter"
  | "linkedin"
  | "whatsapp"
  | "telegram"
  | "email"
  | "copy";

interface SharePlatform {
  id: SocialPlatform;
  name: string;
  icon: React.ReactNode;
  color: string;
  getUrl: (
    url: string,
    title?: string,
    description?: string,
    hashtags?: string[]
  ) => string;
}

const sharePlatforms: SharePlatform[] = [
  {
    id: "facebook",
    name: "Facebook",
    icon: <Facebook className="h-4 w-4" />,
    color: "text-blue-600",
    getUrl: (url, title, description) => {
      const params = new URLSearchParams({
        u: url,
        ...(title && { quote: title }),
        ...(description && { description }),
      });
      return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
    },
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: <Twitter className="h-4 w-4" />,
    color: "text-blue-400",
    getUrl: (url, title, description, hashtags) => {
      const text = [title, description].filter(Boolean).join(" - ");
      const params = new URLSearchParams({
        url,
        ...(text && { text }),
        ...(hashtags?.length && { hashtags: hashtags.join(",") }),
      });
      return `https://twitter.com/intent/tweet?${params.toString()}`;
    },
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: <Linkedin className="h-4 w-4" />,
    color: "text-blue-700",
    getUrl: (url, title, description) => {
      const params = new URLSearchParams({
        url,
        ...(title && { title }),
        ...(description && { summary: description }),
      });
      return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
    },
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: <MessageCircle className="h-4 w-4" />,
    color: "text-green-600",
    getUrl: (url, title) => {
      const text = title ? `${title} ${url}` : url;
      return `https://wa.me/?text=${encodeURIComponent(text)}`;
    },
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: <MessageCircle className="h-4 w-4" />,
    color: "text-blue-500",
    getUrl: (url, title) => {
      const params = new URLSearchParams({
        url,
        ...(title && { text: title }),
      });
      return `https://t.me/share/url?${params.toString()}`;
    },
  },
  {
    id: "email",
    name: "Email",
    icon: <Mail className="h-4 w-4" />,
    color: "text-gray-600",
    getUrl: (url, title, description) => {
      const subject = title || "Check this out";
      const body = [description, url].filter(Boolean).join("\n\n");
      const params = new URLSearchParams({
        subject,
        body,
      });
      return `mailto:?${params.toString()}`;
    },
  },
];

export function SocialShare({
  url,
  title,
  description,
  hashtags = [],
  variant = "button",
  size = "md",
  platforms = ["facebook", "twitter", "linkedin", "whatsapp", "email", "copy"],
  showCopyLink = true,
  showNativeShare = true,
  className,
  children,
}: SocialShareProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const availablePlatforms = sharePlatforms.filter((platform) =>
    platforms.includes(platform.id)
  );

  const handleShare = async (platform: SharePlatform) => {
    if (platform.id === "copy") {
      await handleCopyLink();
      return;
    }

    const shareUrl = platform.getUrl(url, title, description, hashtags);

    // Open in new window
    const windowFeatures = "width=600,height=400,scrollbars=yes,resizable=yes";
    window.open(shareUrl, `share-${platform.id}`, windowFeatures);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t("link_copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(t("copy_failed"));
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log("Share cancelled or failed");
      }
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "sm":
        return "sm";
      case "lg":
        return "lg";
      default:
        return "default";
    }
  };

  // Button variant
  if (variant === "button") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={getButtonSize()}
            className={className}
          >
            <Share2 className="h-4 w-4" />
            {children || t("share")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {availablePlatforms.map((platform) => (
            <DropdownMenuItem
              key={platform.id}
              onClick={() => handleShare(platform)}
              className="flex items-center gap-2"
            >
              <span className={platform.color}>{platform.icon}</span>
              {platform.name}
            </DropdownMenuItem>
          ))}

          {showCopyLink && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleCopyLink}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? t("copied") : t("copy_link")}
              </DropdownMenuItem>
            </>
          )}

          {showNativeShare &&
            typeof navigator !== "undefined" &&
            typeof navigator.share === "function" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleNativeShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  {t("share_native")}
                </DropdownMenuItem>
              </>
            )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Modal variant
  if (variant === "modal") {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size={getButtonSize()}
            className={className}
          >
            <Share2 className="h-4 w-4" />
            {children || t("share")}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("share_this")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* URL Display */}
            <div className="space-y-2">
              <Label htmlFor="share-url">{t("link")}</Label>
              <div className="flex gap-2">
                <Input
                  id="share-url"
                  value={url}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="px-3"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Social Platforms */}
            <div className="space-y-2">
              <Label>{t("share_on")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {availablePlatforms.map((platform) => (
                  <Button
                    key={platform.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(platform)}
                    className="justify-start gap-2"
                  >
                    <span className={platform.color}>{platform.icon}</span>
                    {platform.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Native Share */}
            {showNativeShare &&
              typeof navigator !== "undefined" &&
              typeof navigator.share === "function" && (
                <Button
                  variant="outline"
                  onClick={handleNativeShare}
                  className="w-full gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  {t("share_native")}
                </Button>
              )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Inline variant
  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {availablePlatforms.map((platform) => (
          <Button
            key={platform.id}
            variant="outline"
            size={getButtonSize()}
            onClick={() => handleShare(platform)}
            className="gap-2"
          >
            <span className={platform.color}>{platform.icon}</span>
            {platform.name}
          </Button>
        ))}

        {showCopyLink && (
          <Button
            variant="outline"
            size={getButtonSize()}
            onClick={handleCopyLink}
            className="gap-2"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? t("copied") : t("copy_link")}
          </Button>
        )}
      </div>
    );
  }

  // Dropdown variant (default fallback)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", className)}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{t("share")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availablePlatforms.map((platform) => (
          <DropdownMenuItem
            key={platform.id}
            onClick={() => handleShare(platform)}
            className="flex items-center gap-2"
          >
            <span className={platform.color}>{platform.icon}</span>
            {platform.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Convenience components
export function QuickShare({
  url,
  title,
  className,
}: {
  url: string;
  title?: string;
  className?: string;
}) {
  return (
    <SocialShare
      url={url}
      title={title}
      variant="dropdown"
      platforms={["facebook", "twitter", "copy"]}
      className={className}
    />
  );
}

export function FullShare({
  url,
  title,
  description,
  className,
}: {
  url: string;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <SocialShare
      url={url}
      title={title}
      description={description}
      variant="modal"
      className={className}
    />
  );
}
