"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "next-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ButtonProps } from "@/components/ui/button";

interface BackButtonProps extends Omit<ButtonProps, "onClick"> {
  href?: string;
  fallbackHref?: string;
  showIcon?: boolean;
  iconType?: "arrow" | "chevron";
  children?: React.ReactNode;
  className?: string;
}

export function BackButton({
  href,
  fallbackHref = "/",
  showIcon = true,
  iconType = "arrow",
  children,
  className,
  variant = "ghost",
  size = "sm",
  ...props
}: BackButtonProps) {
  const router = useRouter();
  const { t } = useTranslation("common");

  const handleBack = () => {
    if (href) {
      // Navigate to specific href
      router.push(href);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      // Go back in browser history if available
      router.back();
    } else {
      // Fallback to specified href or home
      router.push(fallbackHref);
    }
  };

  const Icon = iconType === "chevron" ? ChevronLeft : ArrowLeft;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className={cn("gap-2", className)}
      {...props}
    >
      {showIcon && <Icon className="h-4 w-4" />}
      {children || t("back")}
    </Button>
  );
}
