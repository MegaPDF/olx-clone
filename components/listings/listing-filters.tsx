"use client";

import { useState } from "react";
import { useTranslation } from "next-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, X, RotateCcw, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategorySelector } from "./category-selector";
import { ConditionFilter } from "./condition-filter";
import { PriceRangeFilter } from "./price-range-filter";
import { LocationFilter } from "./location-filter";
import type { ListingFilters } from "@/lib/types";

interface ListingFiltersProps {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
  loading?: boolean;
  resultCount?: number;
  variant?: "sidebar" | "mobile" | "horizontal";
  showResultCount?: boolean;
  className?: string;
}

export function ListingFilters({
  filters,
  onFiltersChange,
  loading = false,
  resultCount,
  variant = "sidebar",
  showResultCount = true,
  className,
}: ListingFiltersProps) {
  const { t } = useTranslation(["listings", "common"]);
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof ListingFilters>(
    key: K,
    value: ListingFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = !!(
    filters.category ||
    filters.condition?.length ||
    filters.priceRange ||
    filters.location?.city ||
    filters.features?.promoted ||
    filters.features?.verified
  );

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.condition?.length) count++;
    if (filters.priceRange) count++;
    if (filters.location?.city) count++;
    if (filters.features?.promoted) count++;
    if (filters.features?.verified) count++;
    return count;
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">{t("listings:category")}</h3>
        <CategorySelector
          value={filters.category}
          onValueChange={(value) => updateFilter("category", value)}
          placeholder={t("listings:allCategories")}
        />
      </div>

      <Separator />

      {/* Condition Filter */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">
          {t("listings:condition.label")}
        </h3>
        <ConditionFilter
          value={filters.condition || []}
          onValueChange={(value) =>
            updateFilter("condition", value.length > 0 ? value : undefined)
          }
          variant="grid"
          showIcons={true}
        />
      </div>

      <Separator />

      {/* Price Range Filter */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">{t("listings:priceRange")}</h3>
        <PriceRangeFilter
          value={filters.priceRange}
          onValueChange={(value) => updateFilter("priceRange", value)}
          currency="USD" // TODO: Get from user preferences
        />
      </div>

      <Separator />

      {/* Location Filter */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">{t("listings:location")}</h3>
        <LocationFilter
          value={filters.location}
          onValueChange={(value) => updateFilter("location", value)}
        />
      </div>

      <Separator />

      {/* Features */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">{t("listings:features")}</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.features?.promoted || false}
              onChange={(e) =>
                updateFilter("features", {
                  ...filters.features,
                  promoted: e.target.checked || undefined,
                })
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm">{t("listings:promoted")}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.features?.verified || false}
              onChange={(e) =>
                updateFilter("features", {
                  ...filters.features,
                  verified: e.target.checked || undefined,
                })
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm">{t("listings:verified")}</span>
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <>
          <Separator />
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full"
            disabled={loading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t("common:clearFilters")}
          </Button>
        </>
      )}
    </div>
  );

  if (variant === "mobile") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              {t("common:filters")}
              {hasActiveFilters && (
                <Badge className="ml-2 h-5 w-5 p-0 text-xs">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh]">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                <span>{t("common:filters")}</span>
                {showResultCount && resultCount !== undefined && (
                  <Badge variant="secondary">
                    {resultCount.toLocaleString()} {t("common:results")}
                  </Badge>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            {t("common:clear")}
          </Button>
        )}
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <CategorySelector
          value={filters.category}
          onValueChange={(value) => updateFilter("category", value)}
          placeholder={t("listings:allCategories")}
          variant="compact"
          className="min-w-48"
        />

        <ConditionFilter
          value={filters.condition || []}
          onValueChange={(value) =>
            updateFilter("condition", value.length > 0 ? value : undefined)
          }
          variant="dropdown"
        />

        <PriceRangeFilter
          value={filters.priceRange}
          onValueChange={(value) => updateFilter("priceRange", value)}
          currency="USD"
          variant="dropdown"
        />

        <LocationFilter
          value={filters.location}
          onValueChange={(value) => updateFilter("location", value)}
          variant="dropdown"
        />

        {hasActiveFilters && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              {t("common:clearAll")}
            </Button>
            <Badge variant="secondary">
              {getActiveFilterCount()} {t("common:active")}
            </Badge>
          </>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            {t("common:filters")}
          </CardTitle>
          {showResultCount && resultCount !== undefined && (
            <Badge variant="secondary">
              {resultCount.toLocaleString()} {t("common:results")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <FilterContent />
      </CardContent>
    </Card>
  );
}
