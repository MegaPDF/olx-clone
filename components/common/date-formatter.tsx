"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { formatDistanceToNow, format, parseISO, isValid } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import type { Locale } from "@/lib/types";

interface DateFormatterProps {
  date: Date | string | number;
  format?:
    | "relative"
    | "short"
    | "medium"
    | "long"
    | "full"
    | "time"
    | "datetime"
    | "custom";
  locale?: Locale;
  customFormat?: string;
  showTooltip?: boolean;
  tooltipFormat?: "full" | "long" | "custom";
  tooltipCustomFormat?: string;
  className?: string;
  fallback?: string;
  prefix?: string;
  suffix?: string;
  capitalize?: boolean;
}

export function DateFormatter({
  date,
  format: formatType = "medium",
  customFormat,
  showTooltip = false,
  tooltipFormat = "full",
  tooltipCustomFormat,
  className,
  fallback = "Invalid date",
  prefix,
  suffix,
  capitalize = false,
}: DateFormatterProps) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED
  const currentLocale = (locale || locale) as Locale;

  // Parse the date
  const parseDate = (dateInput: Date | string | number): Date | null => {
    try {
      if (dateInput instanceof Date) {
        return isValid(dateInput) ? dateInput : null;
      }

      if (typeof dateInput === "string") {
        // Try parsing ISO string first
        const isoDate = parseISO(dateInput);
        if (isValid(isoDate)) return isoDate;

        // Fallback to Date constructor
        const fallbackDate = new Date(dateInput);
        return isValid(fallbackDate) ? fallbackDate : null;
      }

      if (typeof dateInput === "number") {
        const numDate = new Date(dateInput);
        return isValid(numDate) ? numDate : null;
      }

      return null;
    } catch {
      return null;
    }
  };

  const parsedDate = parseDate(date);

  if (!parsedDate) {
    return <span className={className}>{fallback}</span>;
  }

  const getDateFnsLocale = () => {
    return currentLocale === "id" ? idLocale : enUS;
  };

  const formatMainDate = (): string => {
    const dateFnsLocale = getDateFnsLocale();

    switch (formatType) {
      case "relative":
        return formatDistanceToNow(parsedDate, {
          addSuffix: true,
          locale: dateFnsLocale,
        });

      case "short":
        return format(parsedDate, "MMM d, yyyy", { locale: dateFnsLocale });

      case "medium":
        return format(parsedDate, "MMM d, yyyy", { locale: dateFnsLocale });

      case "long":
        return format(parsedDate, "MMMM d, yyyy", { locale: dateFnsLocale });

      case "full":
        return format(parsedDate, "EEEE, MMMM d, yyyy", {
          locale: dateFnsLocale,
        });

      case "time":
        return format(parsedDate, "h:mm a", { locale: dateFnsLocale });

      case "datetime":
        return format(parsedDate, "MMM d, yyyy 'at' h:mm a", {
          locale: dateFnsLocale,
        });

      case "custom":
        if (!customFormat)
          return format(parsedDate, "PPP", { locale: dateFnsLocale });
        return format(parsedDate, customFormat, { locale: dateFnsLocale });

      default:
        return format(parsedDate, "PPP", { locale: dateFnsLocale });
    }
  };

  const formatTooltipDate = (): string => {
    const dateFnsLocale = getDateFnsLocale();

    switch (tooltipFormat) {
      case "full":
        return format(parsedDate, "EEEE, MMMM d, yyyy 'at' h:mm:ss a", {
          locale: dateFnsLocale,
        });

      case "long":
        return format(parsedDate, "MMMM d, yyyy 'at' h:mm a", {
          locale: dateFnsLocale,
        });

      case "custom":
        if (!tooltipCustomFormat)
          return format(parsedDate, "PPPp", { locale: dateFnsLocale });
        return format(parsedDate, tooltipCustomFormat, {
          locale: dateFnsLocale,
        });

      default:
        return format(parsedDate, "PPPp", { locale: dateFnsLocale });
    }
  };

  const formattedDate = formatMainDate();
  const displayText = `${prefix || ""}${
    capitalize
      ? formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
      : formattedDate
  }${suffix || ""}`;

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn("cursor-help", className)}>{displayText}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{formatTooltipDate()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <span className={className} title={formatTooltipDate()}>
      {displayText}
    </span>
  );
}

// Convenience components for common use cases
export function RelativeDate({
  date,
  className,
  showTooltip = true,
  ...props
}: Omit<DateFormatterProps, "format"> & { date: Date | string | number }) {
  return (
    <DateFormatter
      date={date}
      format="relative"
      showTooltip={showTooltip}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export function ShortDate({
  date,
  className,
  ...props
}: Omit<DateFormatterProps, "format"> & { date: Date | string | number }) {
  return (
    <DateFormatter
      date={date}
      format="short"
      className={className}
      {...props}
    />
  );
}

export function LongDate({
  date,
  className,
  ...props
}: Omit<DateFormatterProps, "format"> & { date: Date | string | number }) {
  return (
    <DateFormatter date={date} format="long" className={className} {...props} />
  );
}

export function DateTime({
  date,
  className,
  ...props
}: Omit<DateFormatterProps, "format"> & { date: Date | string | number }) {
  return (
    <DateFormatter
      date={date}
      format="datetime"
      className={className}
      {...props}
    />
  );
}

export function TimeOnly({
  date,
  className,
  ...props
}: Omit<DateFormatterProps, "format"> & { date: Date | string | number }) {
  return (
    <DateFormatter
      date={date}
      format="time"
      className={cn("text-sm", className)}
      {...props}
    />
  );
}

export function CreatedAt({
  date,
  className,
  ...props
}: Omit<DateFormatterProps, "format" | "prefix"> & {
  date: Date | string | number;
}) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED

  return (
    <DateFormatter
      date={date}
      format="relative"
      prefix={t("created") + " "}
      showTooltip={true}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export function UpdatedAt({
  date,
  className,
  ...props
}: Omit<DateFormatterProps, "format" | "prefix"> & {
  date: Date | string | number;
}) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED

  return (
    <DateFormatter
      date={date}
      format="relative"
      prefix={t("updated") + " "}
      showTooltip={true}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}
