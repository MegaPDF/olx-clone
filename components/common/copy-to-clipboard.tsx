"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Copy,
  Check,
  ExternalLink,
  Share,
  Link,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyToClipboardProps {
  text: string;
  variant?: "button" | "input" | "inline" | "icon";
  size?: "sm" | "md" | "lg";
  label?: string;
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  truncate?: boolean;
  maxLength?: number;
  sensitive?: boolean; // For hiding/showing sensitive content like tokens
  disabled?: boolean;
}

export function CopyToClipboard({
  text,
  variant = "button",
  size = "md",
  label,
  successMessage,
  errorMessage,
  showToast = true,
  icon,
  className,
  children,
  truncate = false,
  maxLength = 50,
  sensitive = false,
  disabled = false,
}: CopyToClipboardProps) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED
  const [copied, setCopied] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);

  const copyToClipboard = useCallback(async () => {
    if (disabled) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      if (showToast) {
        toast.success(successMessage || t("copied_to_clipboard"));
      }

      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);

      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();

        setCopied(true);
        if (showToast) {
          toast.success(successMessage || t("copied_to_clipboard"));
        }
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        if (showToast) {
          toast.error(errorMessage || t("copy_failed"));
        }
      }
    }
  }, [text, disabled, showToast, successMessage, errorMessage, t]);

  const displayText =
    truncate && text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;

  const sensitiveDisplayText =
    sensitive && !showSensitive
      ? "•".repeat(Math.min(text.length, 20))
      : displayText;

  const getIcon = () => {
    if (icon) return icon;
    return copied ? (
      <Check className="h-4 w-4" />
    ) : (
      <Copy className="h-4 w-4" />
    );
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size={getButtonSize()}
              onClick={copyToClipboard}
              disabled={disabled}
              className={cn(
                "gap-2",
                copied && "text-green-600 border-green-200 bg-green-50",
                className
              )}
            >
              {getIcon()}
              {children || label || (copied ? t("copied") : t("copy"))}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? t("copied") : t("click_to_copy")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Icon variant
  if (variant === "icon") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              disabled={disabled}
              className={cn(
                "h-8 w-8 p-0",
                copied && "text-green-600",
                className
              )}
            >
              {getIcon()}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? t("copied") : t("copy")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Input variant
  if (variant === "input") {
    return (
      <div className={cn("relative", className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="flex gap-2">
          <Input
            type={sensitive && !showSensitive ? "password" : "text"}
            value={sensitive && !showSensitive ? "•".repeat(text.length) : text}
            readOnly
            className="font-mono text-sm"
          />
          {sensitive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSensitive(!showSensitive)}
              className="px-3"
            >
              {showSensitive ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={disabled}
                  className={cn(
                    "px-3",
                    copied && "text-green-600 border-green-200 bg-green-50"
                  )}
                >
                  {getIcon()}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? t("copied") : t("copy")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <code
        className={cn(
          "relative rounded bg-muted px-2 py-1 font-mono text-sm",
          truncate && "max-w-xs overflow-hidden"
        )}
      >
        {sensitiveDisplayText}
      </code>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              disabled={disabled}
              className={cn("h-6 w-6 p-0", copied && "text-green-600")}
            >
              {getIcon()}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? t("copied") : t("copy")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {sensitive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSensitive(!showSensitive)}
          className="h-6 w-6 p-0"
        >
          {showSensitive ? (
            <EyeOff className="h-3 w-3" />
          ) : (
            <Eye className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  );
}
