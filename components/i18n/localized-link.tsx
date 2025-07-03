"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "next-i18next";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

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
    const { i18n } = useTranslation();
    const router = useRouter();

    // Use provided locale or current locale
    const targetLocale = locale || (i18n.language as Locale);

    // Create localized href
    const localizedHref = createLocalizedHref(href, targetLocale);

    // Check if link is active
    const isActive = checkIfActive(
      window.location.pathname,
      localizedHref,
      exactMatch
    );

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

// Hook for programmatic navigation with locale support
export function useLocalizedRouter() {
  const router = useRouter();
  const { i18n } = useTranslation();

  const push = (href: string, locale?: Locale) => {
    const targetLocale = locale || (i18n.language as Locale);
    const localizedHref = createLocalizedHref(href, targetLocale);
    return router.push(localizedHref);
  };

  const replace = (href: string, locale?: Locale) => {
    const targetLocale = locale || (i18n.language as Locale);
    const localizedHref = createLocalizedHref(href, targetLocale);
    return router.replace(localizedHref);
  };

  const prefetch = (href: string, locale?: Locale) => {
    const targetLocale = locale || (i18n.language as Locale);
    const localizedHref = createLocalizedHref(href, targetLocale);
    return router.prefetch(localizedHref);
  };

  return {
    ...router,
    push,
    replace,
    prefetch,
  };
}

// Utility function to get localized URL
export function getLocalizedUrl(href: string, locale?: Locale): string {
  const targetLocale = locale || "en"; // Default to English if no locale provided
  return createLocalizedHref(href, targetLocale);
}

// Higher-order component for adding localization to any link component
export function withLocalization<P extends { href: string }>(
  Component: React.ComponentType<P>
) {
  type LocalizedProps = Omit<P, "href" | "locale"> & { href: string; locale?: Locale };
  
  return forwardRef<HTMLAnchorElement, LocalizedProps>(
    (props, ref) => {
      const { locale, href, ...rest } = props as LocalizedProps;
      const { i18n } = useTranslation();

      const targetLocale = locale || (i18n.language as Locale);
      const localizedHref = createLocalizedHref(href, targetLocale);

      // Only pass ref if Component is a DOM element or supports ref
      return <Component {...(rest as P)} href={localizedHref} {...(ref ? { ref } : {})} />;
    }
  );
}
