"use client";

import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Clock,
  DollarSign,
  Star,
  MapPin,
  Eye,
  Heart,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortOption = {
  value: string;
  field: string;
  order: "asc" | "desc";
  label: string;
  icon: any;
};

interface ListingSortProps {
  value?: string;
  onValueChange: (value: string) => void;
  variant?: "select" | "dropdown" | "buttons";
  showOrder?: boolean;
  className?: string;
}

export function ListingSort({
  value = "relevance",
  onValueChange,
  variant = "select",
  showOrder = false,
  className,
}: ListingSortProps) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED

  const sortOptions: SortOption[] = [
    {
      value: "relevance",
      field: "relevance",
      order: "desc",
      label: t("listings:sort.relevance"),
      icon: Star,
    },
    {
      value: "date_desc",
      field: "createdAt",
      order: "desc",
      label: t("listings:sort.newest"),
      icon: Clock,
    },
    {
      value: "date_asc",
      field: "createdAt",
      order: "asc",
      label: t("listings:sort.oldest"),
      icon: Clock,
    },
    {
      value: "price_asc",
      field: "price",
      order: "asc",
      label: t("listings:sort.priceAsc"),
      icon: DollarSign,
    },
    {
      value: "price_desc",
      field: "price",
      order: "desc",
      label: t("listings:sort.priceDesc"),
      icon: DollarSign,
    },
    {
      value: "distance_asc",
      field: "distance",
      order: "asc",
      label: t("listings:sort.distance"),
      icon: MapPin,
    },
    {
      value: "views_desc",
      field: "views",
      order: "desc",
      label: t("listings:sort.mostViewed"),
      icon: Eye,
    },
    {
      value: "favorites_desc",
      field: "favorites",
      order: "desc",
      label: t("listings:sort.mostFavorited"),
      icon: Heart,
    },
  ];

  const currentSort =
    sortOptions.find((option) => option.value === value) || sortOptions[0];

  if (variant === "buttons") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {sortOptions.map((option) => {
          const Icon = option.icon;
          const isActive = option.value === value;

          return (
            <Button
              key={option.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onValueChange(option.value)}
              className="text-xs"
            >
              <Icon className="h-3 w-3 mr-1" />
              {option.label}
              {isActive && <Check className="h-3 w-3 ml-1" />}
            </Button>
          );
        })}
      </div>
    );
  }

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn("justify-between", className)}
          >
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <span>
                {t("listings:sortBy")}: {currentSort.label}
              </span>
            </div>
            {showOrder && (
              <div className="ml-2">
                {currentSort.order === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            const isActive = option.value === value;

            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onValueChange(option.value)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{option.label}</span>
                {showOrder && (
                  <div className="text-muted-foreground">
                    {option.order === "asc" ? (
                      <SortAsc className="h-3 w-3" />
                    ) : (
                      <SortDesc className="h-3 w-3" />
                    )}
                  </div>
                )}
                {isActive && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {t("listings:sortBy")}:
      </span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => {
            const Icon = option.icon;

            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{option.label}</span>
                  {showOrder && (
                    <div className="ml-auto text-muted-foreground">
                      {option.order === "asc" ? (
                        <SortAsc className="h-3 w-3" />
                      ) : (
                        <SortDesc className="h-3 w-3" />
                      )}
                    </div>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
