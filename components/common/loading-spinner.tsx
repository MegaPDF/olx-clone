"use client";

import { useTranslations, useLocale } from "next-intl";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "pulse" | "bars" | "circle";
  text?: string;
  overlay?: boolean;
  className?: string;
  color?: "primary" | "muted" | "white";
  centered?: boolean;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = "md",
  variant = "spinner",
  text,
  overlay = false,
  className,
  color = "primary",
  centered = false,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED

  const getSizeClass = () => {
    const sizeMap = {
      xs: "w-3 h-3",
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
      xl: "w-12 h-12",
    };
    return sizeMap[size];
  };

  const getColorClass = () => {
    switch (color) {
      case "muted":
        return "text-muted-foreground";
      case "white":
        return "text-white";
      case "primary":
      default:
        return "text-primary";
    }
  };

  const getTextSizeClass = () => {
    const textSizeMap = {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-sm",
      lg: "text-base",
      xl: "text-lg",
    };
    return textSizeMap[size];
  };

  const renderSpinner = () => {
    const baseClass = cn(getSizeClass(), getColorClass());

    switch (variant) {
      case "dots":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full bg-current animate-pulse",
                  size === "xs"
                    ? "w-1 h-1"
                    : size === "sm"
                    ? "w-1.5 h-1.5"
                    : size === "md"
                    ? "w-2 h-2"
                    : size === "lg"
                    ? "w-2.5 h-2.5"
                    : "w-3 h-3",
                  getColorClass()
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "0.6s",
                }}
              />
            ))}
          </div>
        );

      case "pulse":
        return (
          <div
            className={cn(
              "rounded-full bg-current animate-pulse",
              getSizeClass(),
              getColorClass()
            )}
          />
        );

      case "bars":
        return (
          <div className="flex items-end space-x-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "bg-current animate-pulse",
                  size === "xs"
                    ? "w-0.5 h-2"
                    : size === "sm"
                    ? "w-0.5 h-3"
                    : size === "md"
                    ? "w-1 h-4"
                    : size === "lg"
                    ? "w-1 h-5"
                    : "w-1.5 h-6",
                  getColorClass()
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "0.8s",
                }}
              />
            ))}
          </div>
        );

      case "circle":
        return (
          <div
            className={cn(
              "rounded-full border-2 border-current border-t-transparent animate-spin",
              getSizeClass(),
              getColorClass()
            )}
          />
        );

      case "spinner":
      default:
        return <Loader2 className={cn("animate-spin", baseClass)} />;
    }
  };

  const content = (
    <div
      className={cn(
        "flex items-center gap-3",
        centered && "justify-center",
        fullScreen && "min-h-screen",
        className
      )}
    >
      {renderSpinner()}
      {text && (
        <span
          className={cn("font-medium", getTextSizeClass(), getColorClass())}
        >
          {text}
        </span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
}

// Convenience components for common scenarios
export function PageLoader({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED

  return (
    <LoadingSpinner
      size="lg"
      text={text || t("loading")}
      centered
      fullScreen
      className={className}
    />
  );
}

export function SectionLoader({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <LoadingSpinner size="md" text={text} centered />
    </div>
  );
}

export function ButtonLoader({
  size = "sm",
  className,
}: {
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  return <LoadingSpinner size={size} variant="spinner" className={className} />;
}

export function InlineLoader({
  text,
  size = "sm",
  className,
}: {
  text?: string;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  return (
    <LoadingSpinner
      size={size}
      text={text}
      className={cn("inline-flex", className)}
    />
  );
}

export function TableLoader({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="h-4 bg-muted rounded animate-pulse flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardLoader({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
    </div>
  );
}

export function AvatarLoader({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-full bg-muted animate-pulse", className)}
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-muted rounded animate-pulse",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function LoadingOverlay({
  children,
  isLoading,
  text,
  className,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
          <LoadingSpinner text={text} size="md" />
        </div>
      )}
    </div>
  );
}
