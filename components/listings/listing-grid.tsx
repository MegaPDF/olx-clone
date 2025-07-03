"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Grid,
  List,
  RefreshCw,
  AlertCircle,
  Package,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ListingCard } from "./listing-card";
import { ListingPagination } from "./listing-pagination";
import type {
  ListingCard as ListingCardType,
  PaginatedResponse,
} from "@/lib/types";

interface ListingGridProps {
  listings: ListingCardType[];
  loading?: boolean;
  error?: string | null;
  pagination?: PaginatedResponse<ListingCardType>["pagination"];
  onPageChange?: (page: number) => void;
  onFavorite?: (listingId: string) => void;
  onShare?: (listing: ListingCardType) => void;
  onContact?: (listingId: string) => void;
  onRefresh?: () => void;
  variant?: "grid" | "list" | "compact";
  showPagination?: boolean;
  showViewToggle?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  className?: string;
}

export function ListingGrid({
  listings,
  loading = false,
  error = null,
  pagination,
  onPageChange,
  onFavorite,
  onShare,
  onContact,
  onRefresh,
  variant = "grid",
  showPagination = true,
  showViewToggle = false,
  emptyStateTitle,
  emptyStateDescription,
  className,
}: ListingGridProps) {
  const { t } = useTranslation(["listings", "common"]);
  const [currentVariant, setCurrentVariant] = useState(variant);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div
      className={cn(
        "grid gap-4",
        currentVariant === "grid"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1"
      )}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton
            className={cn(
              "w-full",
              currentVariant === "grid" ? "aspect-[4/3]" : "h-24"
            )}
          />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
        {error ? (
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        ) : (
          <Package className="h-12 w-12 text-muted-foreground" />
        )}
      </div>

      <h3 className="text-lg font-semibold mb-2">
        {error
          ? t("common:error")
          : emptyStateTitle || t("listings:noListingsFound")}
      </h3>

      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
        {error
          ? error
          : emptyStateDescription || t("listings:noListingsDescription")}
      </p>

      {error && onRefresh && (
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("common:tryAgain")}
        </Button>
      )}

      {!error && (
        <Button variant="outline" asChild>
          <a href="/search">
            <Search className="h-4 w-4 mr-2" />
            {t("listings:browseDifferent")}
          </a>
        </Button>
      )}
    </div>
  );

  // Error state
  if (error && listings.length === 0) {
    return (
      <div className={className}>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with view toggle */}
      {showViewToggle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {pagination && (
              <span>
                {t("listings:showingResults", {
                  start: (pagination.page - 1) * pagination.limit + 1,
                  end: Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  ),
                  total: pagination.total,
                })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={currentVariant === "grid" ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentVariant("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={currentVariant === "list" ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentVariant("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && listings.length === 0 && <LoadingSkeleton />}

      {/* Listings grid */}
      {listings.length > 0 && (
        <div
          className={cn(
            "grid gap-4",
            currentVariant === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          )}
        >
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onFavorite={onFavorite}
              onShare={onShare}
              onContact={onContact}
              variant={currentVariant === "list" ? "compact" : "default"}
            />
          ))}
        </div>
      )}

      {/* Load more loading state */}
      {loading && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-[4/3]" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && listings.length === 0 && !error && <EmptyState />}

      {/* Pagination */}
      {showPagination && pagination && listings.length > 0 && (
        <ListingPagination
          pagination={pagination}
          onPageChange={onPageChange}
          loading={loading}
        />
      )}
    </div>
  );
}
