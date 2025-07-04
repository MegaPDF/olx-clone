"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";
import { useLocale } from "next-intl";

interface LocalizedLinkProps
  extends Omit<React.ComponentProps<typeof Link>, "href"> {
  href: string;
  locale?: Locale;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  exactMatch?: boolean;
  disabled?: boolean;
}

// Custom hook for localized routing
export function useLocalizedRouter() {
  const router = useRouter();
  const currentLocale = useLocale();

  const push = (href: string, locale?: Locale) => {
    const targetLocale = locale || currentLocale;
    const localizedHref = createLocalizedHref(href, targetLocale as Locale);
    router.push(localizedHref);
  };

  const replace = (href: string, locale?: Locale) => {
    const targetLocale = locale || currentLocale;
    const localizedHref = createLocalizedHref(href, targetLocale as Locale);
    router.replace(localizedHref);
  };

  const back = () => {
    router.back();
  };

  const forward = () => {
    router.forward();
  };

  const refresh = () => {
    router.refresh();
  };

  const prefetch = (href: string, locale?: Locale) => {
    const targetLocale = locale || currentLocale;
    const localizedHref = createLocalizedHref(href, targetLocale as Locale);
    router.prefetch(localizedHref);
  };

  return {
    push,
    replace,
    back,
    forward,
    refresh,
    prefetch,
  };
}

export const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
  (
    {
      href,
      locale,
      children,
      className,
      activeClassName,
      exactMatch = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const currentLocale = useLocale();
    const pathname = usePathname();

    // Use provided locale or current locale
    const targetLocale: Locale = locale || (currentLocale as Locale);

    // Create localized href
    const localizedHref = createLocalizedHref(href, targetLocale);

    // Check if link is active
    const isActive = checkIfActive(pathname, localizedHref, exactMatch);

    // Handle disabled state
    if (disabled) {
      return (
        <span
          className={cn(className, "cursor-not-allowed opacity-50")}
          {...props}
        >
          {children}
        </span>
      );
    }

    return (
      <Link
        ref={ref}
        href={localizedHref}
        className={cn(className, isActive && activeClassName)}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

LocalizedLink.displayName = "LocalizedLink";

// Helper function to create localized href
function createLocalizedHref(href: string, locale: Locale): string {
  // Don't localize external links
  if (href.startsWith("http") || href.startsWith("//")) {
    return href;
  }

  // Don't localize API routes or special Next.js routes
  if (href.startsWith("/api/") || href.startsWith("/_next/")) {
    return href;
  }

  // Remove any existing locale prefix
  const cleanHref = href.replace(/^\/[a-z]{2}(\/|$)/, "/");

  // Add locale prefix for non-default locale
  if (locale === "en") {
    return cleanHref;
  }

  return `/${locale}${cleanHref === "/" ? "" : cleanHref}`;
}

// Helper function to check if link is active
function checkIfActive(
  currentPath: string,
  linkHref: string,
  exactMatch: boolean
): boolean {
  // Remove query parameters and hash for comparison
  const cleanCurrentPath = currentPath.split("?")[0].split("#")[0];
  const cleanLinkHref = linkHref.split("?")[0].split("#")[0];

  if (exactMatch) {
    return cleanCurrentPath === cleanLinkHref;
  }

  // For non-exact match, check if current path starts with link href
  // Handle root path specially
  if (cleanLinkHref === "/") {
    return cleanCurrentPath === "/";
  }

  return cleanCurrentPath.startsWith(cleanLinkHref);
}
