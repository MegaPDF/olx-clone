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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ChevronDown, FolderOpen, Grid3X3, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryDetail, CategoryTree } from "@/lib/types";
import { useEffect, useState } from "react";

interface CategorySelectorProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  placeholder?: string;
  allowClear?: boolean;
  showIcon?: boolean;
  variant?: "default" | "compact" | "tree";
  className?: string;
}

export function CategorySelector({
  value,
  onValueChange,
  placeholder,
  allowClear = true,
  showIcon = true,
  variant = "default",
  className,
}: CategorySelectorProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryTree | null>(
    null
  );

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories?tree=true");
        const data = await response.json();

        if (data.success) {
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Find selected category
  useEffect(() => {
    if (value && categories.length > 0) {
      const findCategory = (cats: CategoryTree[]): CategoryTree | null => {
        for (const cat of cats) {
          if (cat.id === value) return cat;
          if (cat.children.length > 0) {
            const found = findCategory(cat.children);
            if (found) return found;
          }
        }
        return null;
      };

      setSelectedCategory(findCategory(categories));
    } else {
      setSelectedCategory(null);
    }
  }, [value, categories]);

  const handleSelect = (categoryId: string) => {
    onValueChange(categoryId === value ? undefined : categoryId);
    setOpen(false);
  };

  const handleClear = () => {
    onValueChange(undefined);
  };

  const getCategoryName = (category: CategoryTree) => {
    return (
      category.name[locale as keyof typeof category.name] || category.name.en
    );
  };

  const renderCategoryItem = (category: CategoryTree, level = 0) => (
    <div key={category.id}>
      <CommandItem
        value={category.id}
        onSelect={() => handleSelect(category.id)}
        className={cn(
          "flex items-center gap-2 cursor-pointer",
          level > 0 && "ml-4"
        )}
      >
        <div className="flex items-center gap-2 flex-1">
          {showIcon && level === 0 && (
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={cn(level > 0 && "text-sm text-muted-foreground")}>
            {getCategoryName(category)}
          </span>
          <Badge variant="secondary" className="ml-auto">
            {category.listingCount}
          </Badge>
        </div>
        {category.id === value && <Check className="h-4 w-4" />}
      </CommandItem>

      {category.children.map((child) => renderCategoryItem(child, level + 1))}
    </div>
  );

  if (variant === "compact") {
    return (
      <Select
        value={value || ""}
        onValueChange={(val) => onValueChange(val || undefined)}
      >
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue
            placeholder={placeholder || t("listings:selectCategory")}
          />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <div className="p-2">
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <span>{getCategoryName(category)}</span>
                  <Badge variant="secondary">{category.listingCount}</Badge>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              {selectedCategory ? (
                <>
                  {showIcon && <FolderOpen className="h-4 w-4" />}
                  <span>{getCategoryName(selectedCategory)}</span>
                  <Badge variant="secondary">
                    {selectedCategory.listingCount}
                  </Badge>
                </>
              ) : (
                <span className="text-muted-foreground">
                  {placeholder || t("listings:selectCategory")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {allowClear && selectedCategory && (
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
        <PopoverContent className="w-full p-0" side="bottom" align="start">
          <Command>
            <CommandInput
              placeholder={t("listings:searchCategories")}
              className="h-9"
            />
            <CommandEmpty>{t("listings:noCategoriesFound")}</CommandEmpty>
            <ScrollArea className="max-h-60">
              <CommandGroup>
                {loading ? (
                  <div className="p-2 space-y-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  categories.map((category) => renderCategoryItem(category))
                )}
              </CommandGroup>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
