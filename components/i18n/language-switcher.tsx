"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

interface LanguageSwitcherProps {
  variant?: "button" | "dropdown" | "minimal";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showFlag?: boolean;
  className?: string;
}

interface LanguageOption {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: LanguageOption[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
  },
  {
    code: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    flag: "🇮🇩",
  },
];
export function LanguageSwitcher({
  variant = "dropdown",
  size = "md",
  showLabel = true,
  showFlag = true,
  className,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("common");

  const changeLanguage = async (locale: Locale) => {
    if (locale === locale) return;

    // Get current path without locale prefix
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}(\/|$)/, "/");

    // Create new path with selected locale
    const newPath =
      locale === "en"
        ? pathWithoutLocale
        : `/${locale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;

    // Navigate to new path
    router.push(newPath);

    // Change language in i18n
    await i18n.changeLanguage(locale);
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

  const getFlagSize = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  // Minimal variant - just flags
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {languages.map((language) => (
          <Button
            key={language.code}
            variant={language.code === locale ? "default" : "ghost"}
            size="sm"
            onClick={() => changeLanguage(language.code)}
            className={cn(
              "h-8 w-8 p-0",
              language.code === locale && "ring-2 ring-ring ring-offset-2"
            )}
            title={language.name}
          >
            <span className={getFlagSize()}>{language.flag}</span>
          </Button>
        ))}
      </div>
    );
  }

  // Button variant - toggle between languages
  if (variant === "button") {
    const nextLanguage =
      languages.find((lang) => lang.code !== locale) || languages[0];

    return (
      <Button
        variant="outline"
        size={getButtonSize()}
        onClick={() => changeLanguage(nextLanguage.code)}
        className={cn("gap-2", className)}
        title={t("switch_to", { language: nextLanguage.name })}
      >
        {showFlag && <span className={getFlagSize()}>{nextLanguage.flag}</span>}
        {showLabel && (
          <span className="hidden sm:inline">{nextLanguage.nativeName}</span>
        )}
        <Globe className="h-4 w-4" />
      </Button>
    );
  }

  // Dropdown variant (default)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={getButtonSize()}
          className={cn("gap-2", className)}
        >
          {showFlag && (
            <span className={getFlagSize()}>{currentLanguage.flag}</span>
          )}
          {showLabel && (
            <span className="hidden sm:inline">
              {currentLanguage.nativeName}
            </span>
          )}
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              {showFlag && (
                <span className={getFlagSize()}>{language.flag}</span>
              )}
              <div className="flex flex-col">
                <span className="font-medium">{language.name}</span>
                <span className="text-xs text-muted-foreground">
                  {language.nativeName}
                </span>
              </div>
            </div>
            {language.code === locale && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
