"use client";

import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { Currency, Locale } from "@/lib/types";

interface CurrencyFormatterProps {
  amount: number;
  currency?: Currency;
  locale?: Locale;
  showSymbol?: boolean;
  showCode?: boolean;
  variant?: "default" | "compact" | "minimal";
  size?: "sm" | "md" | "lg";
  className?: string;
  prefix?: string;
  suffix?: string;
  colorize?: boolean; // Color based on positive/negative values
  showSign?: boolean; // Show + for positive values
  decimals?: number; // Override default decimal places
}

export function CurrencyFormatter({
  amount,
  currency = "USD",
  showSymbol = true,
  showCode = false,
  variant = "default",
  size = "md",
  className,
  prefix,
  suffix,
  colorize = false,
  showSign = false,
  decimals,
}: CurrencyFormatterProps) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale() as Locale; // CHANGED

  const formatAmount = (amount: number, currency: Currency, locale: Locale) => {
    const localeMap = {
      en: "en-US",
      id: "id-ID",
    };

    // Determine decimal places
    let decimalPlaces = decimals;
    if (decimalPlaces === undefined) {
      if (variant === "compact") {
        decimalPlaces = currency === "IDR" ? 0 : 0; // No decimals for compact
      } else {
        decimalPlaces = currency === "IDR" ? 0 : 2; // Standard formatting
      }
    }

    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    };

    if (showSymbol) {
      options.style = "currency";
      options.currency = currency;
    } else {
      options.style = "decimal";
    }

    if (variant === "compact") {
      options.notation = "compact";
      options.compactDisplay = "short";
    }

    return new Intl.NumberFormat(localeMap[locale], options).format(amount);
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-lg font-semibold";
      default:
        return "text-base";
    }
  };

  const getColorClasses = () => {
    if (!colorize) return "";

    if (amount > 0) {
      return "text-green-600";
    } else if (amount < 0) {
      return "text-red-600";
    }
    return "text-muted-foreground";
  };

  const formatDisplayAmount = () => {
    let displayAmount = amount;
    let sign = "";

    // Handle sign display
    if (showSign && amount > 0) {
      sign = "+";
    }

    const formattedAmount = formatAmount(
      Math.abs(displayAmount),
      currency,
      locale
    );

    // For negative amounts, the formatter already includes the minus sign
    if (amount < 0) {
      return formattedAmount;
    }

    return sign + formattedAmount;
  };

  const renderCurrencyCode = () => {
    if (!showCode) return null;
    return (
      <span className="ml-1 text-xs text-muted-foreground font-normal">
        {currency}
      </span>
    );
  };

  const renderVariantSpecific = () => {
    const formattedAmount = formatDisplayAmount();

    switch (variant) {
      case "minimal":
        return (
          <span
            className={cn(
              "font-mono tabular-nums",
              getSizeClasses(),
              getColorClasses()
            )}
          >
            {prefix}
            {formattedAmount}
            {suffix}
            {renderCurrencyCode()}
          </span>
        );

      case "compact":
        return (
          <span
            className={cn(
              "font-semibold tabular-nums",
              getSizeClasses(),
              getColorClasses()
            )}
          >
            {prefix}
            {formattedAmount}
            {suffix}
            {renderCurrencyCode()}
          </span>
        );

      default:
        return (
          <span
            className={cn(
              "font-medium tabular-nums",
              getSizeClasses(),
              getColorClasses()
            )}
          >
            {prefix}
            {formattedAmount}
            {suffix}
            {renderCurrencyCode()}
          </span>
        );
    }
  };

  return (
    <span
      className={cn("inline-flex items-baseline", className)}
      title={`${amount} ${currency}`}
    >
      {renderVariantSpecific()}
    </span>
  );
}

// Convenience components for common use cases
export function Price({
  amount,
  currency,
  className,
  ...props
}: Omit<CurrencyFormatterProps, "variant"> & { amount: number }) {
  return (
    <CurrencyFormatter
      amount={amount}
      currency={currency}
      variant="default"
      size="md"
      className={cn("font-semibold", className)}
      {...props}
    />
  );
}

export function CompactPrice({
  amount,
  currency,
  className,
  ...props
}: Omit<CurrencyFormatterProps, "variant"> & { amount: number }) {
  return (
    <CurrencyFormatter
      amount={amount}
      currency={currency}
      variant="compact"
      size="sm"
      className={className}
      {...props}
    />
  );
}

export function LargePrice({
  amount,
  currency,
  className,
  ...props
}: Omit<CurrencyFormatterProps, "variant" | "size"> & { amount: number }) {
  return (
    <CurrencyFormatter
      amount={amount}
      currency={currency}
      variant="default"
      size="lg"
      className={className}
      {...props}
    />
  );
}

export function RevenueDisplay({
  amount,
  currency,
  className,
  ...props
}: Omit<CurrencyFormatterProps, "variant" | "colorize" | "showSign"> & {
  amount: number;
}) {
  return (
    <CurrencyFormatter
      amount={amount}
      currency={currency}
      variant="default"
      colorize={true}
      showSign={true}
      className={className}
      {...props}
    />
  );
}
