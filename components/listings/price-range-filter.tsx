"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DollarSign, X, ChevronDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type { Currency } from "@/lib/types";

interface PriceRangeValue {
  min: number;
  max: number;
}

interface PriceRangeFilterProps {
  value?: PriceRangeValue;
  onValueChange: (value: PriceRangeValue | undefined) => void;
  currency?: Currency;
  variant?: "dropdown" | "form" | "compact" | "slider";
  showPresets?: boolean;
  showCurrency?: boolean;
  minValue?: number;
  maxValue?: number;
  step?: number;
  className?: string;
}

const defaultPresets = {
  USD: [
    { label: "Under $100", min: 0, max: 100 },
    { label: "$100 - $500", min: 100, max: 500 },
    { label: "$500 - $1,000", min: 500, max: 1000 },
    { label: "$1,000 - $5,000", min: 1000, max: 5000 },
    { label: "$5,000+", min: 5000, max: 999999 },
  ],
  IDR: [
    { label: "Under Rp 1M", min: 0, max: 1000000 },
    { label: "Rp 1M - 5M", min: 1000000, max: 5000000 },
    { label: "Rp 5M - 10M", min: 5000000, max: 10000000 },
    { label: "Rp 10M - 50M", min: 10000000, max: 50000000 },
    { label: "Rp 50M+", min: 50000000, max: 999999999 },
  ],
};

export function PriceRangeFilter({
  value,
  onValueChange,
  currency = "USD",
  variant = "dropdown",
  showPresets = true,
  showCurrency = false,
  minValue = 0,
  maxValue,
  step = 10,
  className,
}: PriceRangeFilterProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");
  const [priceStats, setPriceStats] = useState<{
    min: number;
    max: number;
    avg: number;
  } | null>(null);

  const debouncedMin = useDebounce(minInput, 500);
  const debouncedMax = useDebounce(maxInput, 500);

  // Get default max value based on currency
  const defaultMaxValue =
    maxValue || (currency === "IDR" ? 1000000000 : 100000);

  // Get presets for current currency
  const presets = defaultPresets[currency] || defaultPresets.USD;

  // Sync inputs with value
  useEffect(() => {
    setMinInput(value?.min ? value.min.toString() : "");
    setMaxInput(value?.max ? value.max.toString() : "");
  }, [value]);

  // Update value when inputs change
  useEffect(() => {
    const min = debouncedMin ? parseInt(debouncedMin) : 0;
    const max = debouncedMax ? parseInt(debouncedMax) : defaultMaxValue;

    if (debouncedMin || debouncedMax) {
      onValueChange({ min, max });
    }
  }, [debouncedMin, debouncedMax, defaultMaxValue, onValueChange]);

  // Fetch price statistics
  useEffect(() => {
    const fetchPriceStats = async () => {
      try {
        const response = await fetch(
          `/api/listings/stats/prices?currency=${currency}`
        );
        const data = await response.json();

        if (data.success) {
          setPriceStats(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch price stats:", error);
      }
    };

    fetchPriceStats();
  }, [currency]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactPrice = (amount: number) => {
    if (currency === "IDR") {
      if (amount >= 1000000000)
        return `Rp ${(amount / 1000000000).toFixed(1)}B`;
      if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(1)}K`;
      return `Rp ${amount}`;
    } else {
      if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
      return `${amount}`;
    }
  };

  const handlePresetSelect = (preset: (typeof presets)[0]) => {
    onValueChange({
      min: preset.min,
      max:
        preset.max === 999999 || preset.max === 999999999
          ? defaultMaxValue
          : preset.max,
    });
    setOpen(false);
  };

  const handleSliderChange = (values: number[]) => {
    onValueChange({
      min: values[0],
      max: values[1],
    });
  };

  const handleClear = () => {
    onValueChange(undefined);
    setMinInput("");
    setMaxInput("");
  };

  const getRangeLabel = () => {
    if (!value) return null;

    const { min, max } = value;
    if (min === 0 && max >= defaultMaxValue * 0.9) {
      return t("listings:anyPrice");
    }
    if (min === 0) {
      return t("listings:upTo", { amount: formatCompactPrice(max) });
    }
    if (max >= defaultMaxValue * 0.9) {
      return t("listings:from", { amount: formatCompactPrice(min) });
    }
    return `${formatCompactPrice(min)} - ${formatCompactPrice(max)}`;
  };

  if (variant === "compact") {
    return (
      <Select
        value={value ? `${value.min}-${value.max}` : ""}
        onValueChange={(presetValue) => {
          if (!presetValue) {
            handleClear();
            return;
          }
          const preset = presets.find(
            (p) => `${p.min}-${p.max}` === presetValue
          );
          if (preset) {
            handlePresetSelect(preset);
          }
        }}
      >
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue placeholder={t("listings:priceRange")} />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem
              key={`${preset.min}-${preset.max}`}
              value={`${preset.min}-${preset.max}`}
            >
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (variant === "slider") {
    const sliderMin = priceStats?.min || minValue;
    const sliderMax = priceStats?.max || defaultMaxValue;

    return (
      <div className={cn("space-y-4", className)}>
        <div className="space-y-2">
          <Label>{t("listings:priceRange")}</Label>
          <Slider
            value={[value?.min || sliderMin, value?.max || sliderMax]}
            onValueChange={handleSliderChange}
            min={sliderMin}
            max={sliderMax}
            step={step}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatCompactPrice(sliderMin)}</span>
            <span className="font-medium">
              {getRangeLabel() || t("listings:anyPrice")}
            </span>
            <span>{formatCompactPrice(sliderMax)}</span>
          </div>
        </div>

        {showPresets && (
          <div className="flex flex-wrap gap-1">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="min-price">{t("listings:minPrice")}</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="min-price"
                type="number"
                placeholder="0"
                value={minInput}
                onChange={(e) => setMinInput(e.target.value)}
                className="pl-10"
                min={minValue}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-price">{t("listings:maxPrice")}</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="max-price"
                type="number"
                placeholder={defaultMaxValue.toString()}
                value={maxInput}
                onChange={(e) => setMaxInput(e.target.value)}
                className="pl-10"
                min={minValue}
              />
            </div>
          </div>
        </div>

        {showPresets && (
          <div className="space-y-2">
            <Label>{t("listings:quickSelect")}</Label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetSelect(preset)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {priceStats && (
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>
                {t("listings:avgPrice")}: {formatPrice(priceStats.avg)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>{getRangeLabel() || t("listings:priceRange")}</span>
          </div>
          <div className="flex items-center gap-1">
            {value && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="bottom" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">
              {t("listings:priceRange")}
            </h4>
            <p className="text-sm text-muted-foreground">
              {t("listings:setPriceRange")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">{t("listings:minPrice")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={minInput}
                onChange={(e) => setMinInput(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{t("listings:maxPrice")}</Label>
              <Input
                type="number"
                placeholder={t("common:noLimit")}
                value={maxInput}
                onChange={(e) => setMaxInput(e.target.value)}
                className="h-8"
              />
            </div>
          </div>

          {showPresets && (
            <div className="space-y-2">
              <Label className="text-xs">{t("listings:quickSelect")}</Label>
              <div className="grid grid-cols-1 gap-1">
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePresetSelect(preset)}
                    className="justify-start h-8 text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {priceStats && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              <div className="flex justify-between">
                <span>{t("listings:range")}:</span>
                <span>
                  {formatCompactPrice(priceStats.min)} -{" "}
                  {formatCompactPrice(priceStats.max)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("listings:average")}:</span>
                <span>{formatCompactPrice(priceStats.avg)}</span>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
