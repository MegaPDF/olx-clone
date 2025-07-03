"use client";

import { useTranslation } from "next-i18next";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaginatedResponse } from "@/lib/types";

interface ListingPaginationProps {
  pagination: PaginatedResponse<any>["pagination"];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  loading?: boolean;
  showPageSizeSelector?: boolean;
  showInfo?: boolean;
  className?: string;
}

export function ListingPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  loading = false,
  showPageSizeSelector = false,
  showInfo = true,
  className,
}: ListingPaginationProps) {
  const { t } = useTranslation(["common"]);

  const { page, limit, total, pages, hasNext, hasPrev } = pagination;

  const generatePageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    // Always include first page
    range.push(1);

    // Add pages around current page
    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(pages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    // Always include last page if there are multiple pages
    if (pages > 1) {
      range.push(pages);
    }

    // Add dots where there are gaps
    let prev = 0;
    for (const current of range) {
      if (current - prev === 2) {
        rangeWithDots.push(prev + 1);
      } else if (current - prev !== 1) {
        rangeWithDots.push("...");
      }
      rangeWithDots.push(current);
      prev = current;
    }

    return rangeWithDots;
  };

  const pageNumbers = generatePageNumbers();

  const handlePageClick = (newPage: number) => {
    if (loading || newPage === page || newPage < 1 || newPage > pages) return;
    onPageChange?.(newPage);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    onPageSizeChange?.(parseInt(newPageSize));
  };

  if (pages <= 1 && !showPageSizeSelector) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {/* Results info */}
      {showInfo && (
        <div className="text-sm text-muted-foreground">
          {t("showingResults", {
            start: (page - 1) * limit + 1,
            end: Math.min(page * limit, total),
            total: total.toLocaleString(),
          })}
        </div>
      )}

      {/* Page size selector */}
      {showPageSizeSelector && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t("itemsPerPage")}
          </span>
          <Select
            value={limit.toString()}
            onValueChange={handlePageSizeChange}
            disabled={loading}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Pagination controls */}
      {pages > 1 && (
        <div className="flex items-center gap-1">
          {/* First page */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handlePageClick(1)}
            disabled={loading || !hasPrev}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handlePageClick(page - 1)}
            disabled={loading || !hasPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNum, index) => {
              if (pageNum === "...") {
                return (
                  <div
                    key={`dots-${index}`}
                    className="flex h-8 w-8 items-center justify-center"
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              }

              const pageNumber = pageNum as number;
              const isActive = pageNumber === page;

              return (
                <Button
                  key={pageNumber}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageClick(pageNumber)}
                  disabled={loading}
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          {/* Next page */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handlePageClick(page + 1)}
            disabled={loading || !hasNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handlePageClick(pages)}
            disabled={loading || !hasNext}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
