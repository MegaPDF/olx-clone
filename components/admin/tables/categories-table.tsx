"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Package,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryDetail } from "@/lib/types/category";

interface CategoriesTableProps {
  categories: CategoryDetail[];
  isLoading?: boolean;
  onEdit?: (category: CategoryDetail) => void;
  onDelete?: (category: CategoryDetail) => void;
  onToggleStatus?: (category: CategoryDetail) => void;
  onCreateNew?: () => void;
  className?: string;
}

type SortField = "name" | "createdAt" | "listingCount" | "sortOrder";
type SortDirection = "asc" | "desc";

interface TableFilters {
  search: string;
  status: "all" | "active" | "inactive";
  parent: "all" | "main" | "sub";
}

export function CategoriesTable({
  categories,
  isLoading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onCreateNew,
  className,
}: CategoriesTableProps) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("sortOrder");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filters, setFilters] = useState<TableFilters>({
    search: "",
    status: "all",
    parent: "all",
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-600" />
    );
  };

  const filteredAndSortedCategories = categories
    .filter((category) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !category.name.en.toLowerCase().includes(searchLower) &&
          !category.name.id.toLowerCase().includes(searchLower) &&
          !category.slug.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== "all") {
        if (filters.status === "active" && !category.isActive) return false;
        if (filters.status === "inactive" && category.isActive) return false;
      }

      // Parent filter
      if (filters.parent !== "all") {
        if (filters.parent === "main" && category.parent) return false;
        if (filters.parent === "sub" && !category.parent) return false;
      }

      return true;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.name.en.toLowerCase();
          bValue = b.name.en.toLowerCase();
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "listingCount":
          aValue = a.listingCount;
          bValue = b.listingCount;
          break;
        case "sortOrder":
          aValue = a.sortOrder;
          bValue = b.sortOrder;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCategories(filteredAndSortedCategories.map((c) => c.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId)
      );
    }
  };

  const isAllSelected =
    selectedCategories.length === filteredAndSortedCategories.length &&
    filteredAndSortedCategories.length > 0;
  const isPartiallySelected =
    selectedCategories.length > 0 &&
    selectedCategories.length < filteredAndSortedCategories.length;

  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        {/* Loading skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-8 w-64 bg-muted rounded animate-pulse" />
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("categories.search_placeholder")}
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="pl-10 w-64"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(value: any) =>
              setFilters({ ...filters, status: value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all_status")}</SelectItem>
              <SelectItem value="active">
                {t("categories.status.active")}
              </SelectItem>
              <SelectItem value="inactive">
                {t("categories.status.inactive")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.parent}
            onValueChange={(value: any) =>
              setFilters({ ...filters, parent: value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="main">
                {t("categories.main_categories")}
              </SelectItem>
              <SelectItem value="sub">
                {t("categories.sub_categories")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            {t("categories.create_new")}
          </Button>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedCategories.length > 0 && (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm text-blue-800 dark:text-blue-200">
            {t("categories.selected_count", {
              count: selectedCategories.length,
            })}
          </span>
          <Button variant="outline" size="sm">
            {t("common.bulk_edit")}
          </Button>
          <Button variant="outline" size="sm">
            {t("common.bulk_delete")}
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className={
                    isPartiallySelected
                      ? "data-[state=checked]:bg-blue-600"
                      : ""
                  }
                />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("categories.table.name")}</span>
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead>{t("categories.table.parent")}</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("listingCount")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("categories.table.listings")}</span>
                  {getSortIcon("listingCount")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("sortOrder")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("categories.table.order")}</span>
                  {getSortIcon("sortOrder")}
                </div>
              </TableHead>
              <TableHead>{t("categories.table.status")}</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("categories.table.created")}</span>
                  {getSortIcon("createdAt")}
                </div>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <Package className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {filters.search ||
                      filters.status !== "all" ||
                      filters.parent !== "all"
                        ? t("categories.no_results")
                        : t("categories.no_categories")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedCategories.map((category) => (
                <TableRow key={category.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) =>
                        handleSelectCategory(category.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {category.icon && (
                        <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-sm">{category.icon}</span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{category.name.en}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {category.name.id}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          /{category.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {category.parent ? (
                      <Badge variant="outline" className="text-xs">
                        {/* Assuming parent is just the ID, we need the full category to show name */}
                        {t("categories.has_parent")}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        {t("categories.main_category")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        {category.listingCount}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {category.sortOrder}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={category.isActive ? "default" : "secondary"}
                      className={cn(
                        "text-xs",
                        category.isActive
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      )}
                    >
                      {category.isActive
                        ? t("categories.status.active")
                        : t("categories.status.inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(category)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                        )}
                        {onToggleStatus && (
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(category)}
                          >
                            {category.isActive ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                {t("categories.deactivate")}
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                {t("categories.activate")}
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(category)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {t("categories.showing_results", {
            start: filteredAndSortedCategories.length > 0 ? 1 : 0,
            end: filteredAndSortedCategories.length,
            total: categories.length,
          })}
        </div>
        {selectedCategories.length > 0 && (
          <div>
            {t("categories.selected_count", {
              count: selectedCategories.length,
            })}
          </div>
        )}
      </div>
    </div>
  );
}
