"use client";

import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Filter,
  ChevronDown,
  Package,
  Star,
  ThumbsUp,
  Minus,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ListingCondition } from "@/lib/types";

interface ConditionFilterProps {
  value: ListingCondition[];
  onValueChange: (conditions: ListingCondition[]) => void;
  variant?: "dropdown" | "grid" | "chips";
  showIcons?: boolean;
  showCounts?: boolean;
  className?: string;
}

const conditionConfig: Record<
  ListingCondition,
  {
    icon: any;
    color: string;
    badge: string;
  }
> = {
  new: {
    icon: Package,
    color: "text-green-600",
    badge: "bg-green-100 text-green-800 border-green-200",
  },
  "like-new": {
    icon: Star,
    color: "text-blue-600",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
  },
  good: {
    icon: ThumbsUp,
    color: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  fair: {
    icon: Minus,
    color: "text-yellow-600",
    badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  poor: {
    icon: AlertTriangle,
    color: "text-red-600",
    badge: "bg-red-100 text-red-800 border-red-200",
  },
};

export function ConditionFilter({
  value,
  onValueChange,
  variant = "dropdown",
  showIcons = true,
  showCounts = false,
  className,
}: ConditionFilterProps) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED

  const conditions: ListingCondition[] = [
    "new",
    "like-new",
    "good",
    "fair",
    "poor",
  ];

  const handleToggle = (condition: ListingCondition) => {
    const newValue = value.includes(condition)
      ? value.filter((c) => c !== condition)
      : [...value, condition];
    onValueChange(newValue);
  };

  const handleClear = () => {
    onValueChange([]);
  };

  const getConditionLabel = (condition: ListingCondition) => {
    return t(`listings:condition.${condition}`);
  };

  const getConditionIcon = (condition: ListingCondition) => {
    const Icon = conditionConfig[condition].icon;
    return <Icon className="h-4 w-4" />;
  };

  if (variant === "chips") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {conditions.map((condition) => {
          const isSelected = value.includes(condition);
          const config = conditionConfig[condition];

          return (
            <Button
              key={condition}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => handleToggle(condition)}
              className={cn("h-8 rounded-full", isSelected && config.color)}
            >
              {showIcons && getConditionIcon(condition)}
              <span className="ml-1">{getConditionLabel(condition)}</span>
              {isSelected && <X className="ml-1 h-3 w-3" />}
            </Button>
          );
        })}
        {value.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-8 text-muted-foreground"
          >
            {t("common:clearAll")}
          </Button>
        )}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div
        className={cn(
          "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2",
          className
        )}
      >
        {conditions.map((condition) => {
          const isSelected = value.includes(condition);
          const config = conditionConfig[condition];

          return (
            <div
              key={condition}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              )}
              onClick={() => handleToggle(condition)}
            >
              <div className={cn("flex items-center gap-2", config.color)}>
                {showIcons && getConditionIcon(condition)}
                <Checkbox
                  checked={isSelected}
                  onChange={() => {}}
                  className="pointer-events-none"
                />
              </div>
              <span className="text-sm font-medium text-center">
                {getConditionLabel(condition)}
              </span>
              {showCounts && (
                <Badge variant="secondary" className="text-xs">
                  0
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("justify-between", className)}>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>
              {value.length > 0
                ? t("listings:conditionsSelected", { count: value.length })
                : t("listings:condition.label")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {value.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {value.length}
              </Badge>
            )}
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {conditions.map((condition) => {
          const isSelected = value.includes(condition);
          const config = conditionConfig[condition];

          return (
            <DropdownMenuItem
              key={condition}
              onClick={() => handleToggle(condition)}
              className="flex items-center gap-2"
            >
              <Checkbox
                checked={isSelected}
                onChange={() => {}}
                className="pointer-events-none"
              />
              {showIcons && (
                <div className={config.color}>
                  {getConditionIcon(condition)}
                </div>
              )}
              <span className="flex-1">{getConditionLabel(condition)}</span>
              {showCounts && (
                <Badge variant="secondary" className="ml-auto">
                  0
                </Badge>
              )}
            </DropdownMenuItem>
          );
        })}
        {value.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleClear}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              {t("common:clearAll")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
