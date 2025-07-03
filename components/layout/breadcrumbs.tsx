"use client";

import { Fragment } from "react";
import { useTranslation } from "next-i18next";
import { ChevronRight, Home, MoreHorizontal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Breadcrumb } from "@/lib/types";
import { LocalizedLink } from "../i18n/localized-link";

interface BreadcrumbsProps {
  items: Breadcrumb[];
  separator?: React.ReactNode;
  maxItems?: number;
  showHome?: boolean;
  homeHref?: string;
  variant?: "default" | "minimal" | "compact";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Breadcrumbs({
  items,
  separator,
  maxItems = 5,
  showHome = true,
  homeHref = "/",
  variant = "default",
  size = "md",
  className,
}: BreadcrumbsProps) {
  const { t } = useTranslation("common");

  // Filter out empty items
  const validItems = items.filter((item) => item.title);

  // Add home item if enabled and not already present
  const allItems =
    showHome && validItems[0]?.href !== homeHref
      ? [{ title: t("home"), href: homeHref }, ...validItems]
      : validItems;

  // Handle item overflow
  const shouldCollapse = allItems.length > maxItems;
  const visibleItems = shouldCollapse
    ? [
        allItems[0], // First item (usually home)
        ...allItems.slice(-2), // Last 2 items
      ]
    : allItems;

  const collapsedItems = shouldCollapse
    ? allItems.slice(1, -2) // Middle items
    : [];

  const getSeparator = () => {
    if (separator) return separator;
    return <ChevronRight className="h-4 w-4 text-muted-foreground" />;
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  const renderBreadcrumbItem = (item: Breadcrumb, isLast: boolean) => {
    const itemClasses = cn(
      "transition-colors duration-200",
      getSizeClasses(),
      isLast
        ? "text-foreground font-medium cursor-default"
        : "text-muted-foreground hover:text-foreground",
      variant === "minimal" && "font-normal"
    );

    // Home icon for first item
    const isHome = item.href === homeHref;
    const showHomeIcon = isHome && showHome && variant !== "minimal";

    if (isLast || !item.href) {
      return (
        <span className={itemClasses}>
          {showHomeIcon ? (
            <div className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              {variant !== "compact" && <span>{item.title}</span>}
            </div>
          ) : (
            item.title
          )}
        </span>
      );
    }

    return (
      <LocalizedLink
        href={item.href}
        className={cn(
          itemClasses,
          "hover:underline focus:underline focus:outline-none"
        )}
      >
        {showHomeIcon ? (
          <div className="flex items-center gap-1">
            <Home className="h-4 w-4" />
            {variant !== "compact" && <span>{item.title}</span>}
          </div>
        ) : (
          item.title
        )}
      </LocalizedLink>
    );
  };

  const renderCollapsedItems = () => {
    if (collapsedItems.length === 0) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">{t("breadcrumbs.show_more")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {collapsedItems.map((item, index) => (
            <DropdownMenuItem key={index} asChild>
              {item.href ? (
                <LocalizedLink href={item.href}>{item.title}</LocalizedLink>
              ) : (
                <span>{item.title}</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  if (allItems.length === 0) return null;

  // Minimal variant - just the current page
  if (variant === "minimal") {
    const lastItem = allItems[allItems.length - 1];
    return (
      <div className={cn("flex items-center", className)}>
        {renderBreadcrumbItem(lastItem, true)}
      </div>
    );
  }

  return (
    <nav
      aria-label={t("breadcrumbs.navigation")}
      className={cn("flex items-center space-x-1", className)}
    >
      <ol className="flex items-center space-x-1">
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          const showCollapsedBefore = shouldCollapse && index === 1;

          return (
            <Fragment key={index}>
              {/* Show collapsed items dropdown before second visible item */}
              {showCollapsedBefore && (
                <>
                  <li className="flex items-center">
                    {renderCollapsedItems()}
                  </li>
                  <li className="flex items-center">{getSeparator()}</li>
                </>
              )}

              <li className="flex items-center">
                {renderBreadcrumbItem(item, isLast)}
              </li>

              {/* Add separator if not last item */}
              {!isLast && (
                <li className="flex items-center">{getSeparator()}</li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

// Hook to generate breadcrumbs from router pathname
export function useBreadcrumbs() {
  const { t } = useTranslation("common");

  const generateBreadcrumbs = (pathname: string): Breadcrumb[] => {
    // Remove locale prefix and split path
    const cleanPath = pathname.replace(/^\/[a-z]{2}(\/|$)/, "/");
    const segments = cleanPath.split("/").filter(Boolean);

    const breadcrumbs: Breadcrumb[] = [];
    let currentPath = "";

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Transform segment to readable title
      const title = formatSegmentTitle(segment, t);

      breadcrumbs.push({
        title,
        href: currentPath,
      });
    });

    return breadcrumbs;
  };

  return { generateBreadcrumbs };
}

// Helper function to format path segments into readable titles
function formatSegmentTitle(
  segment: string,
  t: (key: string) => string
): string {
  // Handle special routes
  const routeMap: Record<string, string> = {
    admin: t("navigation.admin"),
    profile: t("navigation.profile"),
    settings: t("navigation.settings"),
    listings: t("navigation.listings"),
    messages: t("navigation.messages"),
    favorites: t("navigation.favorites"),
    "create-listing": t("navigation.create_listing"),
    search: t("navigation.search"),
    categories: t("navigation.categories"),
    help: t("navigation.help"),
    about: t("navigation.about"),
    contact: t("navigation.contact"),
    privacy: t("navigation.privacy"),
    terms: t("navigation.terms"),
  };

  // Return mapped title or format the segment
  return routeMap[segment] || formatString(segment);
}

// Helper function to format strings (kebab-case to title case)
function formatString(str: string): string {
  return str.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

// Component for automatic breadcrumbs based on current route
interface AutoBreadcrumbsProps extends Omit<BreadcrumbsProps, "items"> {
  pathname?: string;
  customItems?: Breadcrumb[];
  replacements?: Record<string, Breadcrumb>;
}

export function AutoBreadcrumbs({
  pathname,
  customItems,
  replacements = {},
  ...props
}: AutoBreadcrumbsProps) {
  const { generateBreadcrumbs } = useBreadcrumbs();

  // Use provided pathname or get from window location
  const currentPath =
    pathname || (typeof window !== "undefined" ? window.location.pathname : "");

  let items = customItems || generateBreadcrumbs(currentPath);

  // Apply replacements
  items = items.map((item) => {
    const replacement = replacements[item.href || ""];
    return replacement ? { ...item, ...replacement } : item;
  });

  return <Breadcrumbs items={items} {...props} />;
}
