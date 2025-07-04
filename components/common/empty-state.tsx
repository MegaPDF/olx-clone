"use client";

import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Package,
  Users,
  MessageSquare,
  Search,
  Plus,
  FileText,
  Image,
  Heart,
  ShoppingCart,
  Mail,
  Bell,
  CreditCard,
  BarChart3,
  FolderOpen,
  Inbox,
  Calendar,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
    size?: "sm" | "md" | "lg";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost";
  };
  variant?: "default" | "search" | "error" | "minimal";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

const iconMap = {
  // Common content types
  listings: Package,
  users: Users,
  messages: MessageSquare,
  images: Image,
  files: FileText,
  folders: FolderOpen,

  // Actions
  search: Search,
  add: Plus,
  inbox: Inbox,
  calendar: Calendar,

  // E-commerce
  favorites: Heart,
  cart: ShoppingCart,
  orders: ShoppingCart,

  // Communication
  notifications: Bell,
  emails: Mail,

  // Finance
  payments: CreditCard,
  revenue: BarChart3,

  // Engagement
  reviews: Star,
  ratings: Star,
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
  size = "md",
  className,
  children,
}: EmptyStateProps) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED

  const getDefaultIcon = () => {
    switch (variant) {
      case "search":
        return <Search className="h-12 w-12 text-muted-foreground" />;
      case "error":
        return <Package className="h-12 w-12 text-muted-foreground" />;
      default:
        return <FolderOpen className="h-12 w-12 text-muted-foreground" />;
    }
  };

  const getDefaultContent = () => {
    switch (variant) {
      case "search":
        return {
          title: title || t("empty_states.no_results"),
          description: description || t("empty_states.no_results_description"),
        };
      case "error":
        return {
          title: title || t("empty_states.something_wrong"),
          description:
            description || t("empty_states.something_wrong_description"),
        };
      default:
        return {
          title: title || t("empty_states.no_data"),
          description: description || t("empty_states.no_data_description"),
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "py-8 px-4",
          icon: "h-8 w-8",
          title: "text-lg",
          description: "text-sm",
          spacing: "space-y-3",
        };
      case "lg":
        return {
          container: "py-16 px-6",
          icon: "h-16 w-16",
          title: "text-2xl",
          description: "text-base",
          spacing: "space-y-6",
        };
      default:
        return {
          container: "py-12 px-4",
          icon: "h-12 w-12",
          title: "text-xl",
          description: "text-sm",
          spacing: "space-y-4",
        };
    }
  };

  const defaultContent = getDefaultContent();
  const sizeClasses = getSizeClasses();
  const displayIcon = icon || getDefaultIcon();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizeClasses.container,
        sizeClasses.spacing,
        className
      )}
    >
      {displayIcon && (
        <div className="flex items-center justify-center rounded-full bg-muted p-4">
          {displayIcon}
        </div>
      )}

      <div className="space-y-2">
        <h3 className={cn("font-semibold text-foreground", sizeClasses.title)}>
          {defaultContent.title}
        </h3>

        {defaultContent.description && (
          <p
            className={cn(
              "text-muted-foreground max-w-sm mx-auto",
              sizeClasses.description
            )}
          >
            {defaultContent.description}
          </p>
        )}
      </div>

      {children}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              size={action.size === "md" ? "default" : action.size || "default"}
            >
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || "outline"}
              size="default"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Convenience components for common scenarios
export function NoResults({
  searchQuery,
  onClear,
  className,
  ...props
}: Omit<EmptyStateProps, "variant" | "icon" | "title" | "description"> & {
  searchQuery?: string;
  onClear?: () => void;
}) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED

  return (
    <EmptyState
      variant="search"
      icon={<Search className="h-12 w-12 text-muted-foreground" />}
      title={
        searchQuery
          ? t("empty_states.no_results_for", { query: searchQuery })
          : t("empty_states.no_results")
      }
      description={t("empty_states.try_different_search")}
      action={
        onClear
          ? {
              label: t("clear_search"),
              onClick: onClear,
              variant: "outline",
            }
          : undefined
      }
      className={className}
      {...props}
    />
  );
}

export function NoListings({
  onCreateListing,
  className,
  ...props
}: Omit<EmptyStateProps, "variant" | "icon" | "title" | "description"> & {
  onCreateListing?: () => void;
}) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED

  return (
    <EmptyState
      icon={<Package className="h-12 w-12 text-muted-foreground" />}
      title={t("empty_states.no_listings")}
      description={t("empty_states.no_listings_description")}
      action={
        onCreateListing
          ? {
              label: t("create_listing"),
              onClick: onCreateListing,
              variant: "default",
            }
          : undefined
      }
      className={className}
      {...props}
    />
  );
}

export function NoMessages({
  className,
  ...props
}: Omit<EmptyStateProps, "variant" | "icon" | "title" | "description">) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED

  return (
    <EmptyState
      icon={<MessageSquare className="h-12 w-12 text-muted-foreground" />}
      title={t("empty_states.no_messages")}
      description={t("empty_states.no_messages_description")}
      className={className}
      {...props}
    />
  );
}

export function NoFavorites({
  onBrowse,
  className,
  ...props
}: Omit<EmptyStateProps, "variant" | "icon" | "title" | "description"> & {
  onBrowse?: () => void;
}) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED

  return (
    <EmptyState
      icon={<Heart className="h-12 w-12 text-muted-foreground" />}
      title={t("empty_states.no_favorites")}
      description={t("empty_states.no_favorites_description")}
      action={
        onBrowse
          ? {
              label: t("browse_listings"),
              onClick: onBrowse,
              variant: "default",
            }
          : undefined
      }
      className={className}
      {...props}
    />
  );
}

export function NoNotifications({
  className,
  ...props
}: Omit<EmptyStateProps, "variant" | "icon" | "title" | "description">) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED

  return (
    <EmptyState
      icon={<Bell className="h-12 w-12 text-muted-foreground" />}
      title={t("empty_states.no_notifications")}
      description={t("empty_states.no_notifications_description")}
      size="sm"
      className={className}
      {...props}
    />
  );
}

export function ErrorState({
  onRetry,
  className,
  ...props
}: Omit<EmptyStateProps, "variant" | "icon"> & {
  onRetry?: () => void;
}) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED

  return (
    <EmptyState
      variant="error"
      action={
        onRetry
          ? {
              label: t("try_again"),
              onClick: onRetry,
              variant: "default",
            }
          : undefined
      }
      className={className}
      {...props}
    />
  );
}
