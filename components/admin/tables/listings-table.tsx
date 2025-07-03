"use client";

import { useTranslation } from "next-i18next";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Ban,
  CheckSquare,
  Star,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package,
  DollarSign,
  Crown,
  AlertTriangle,
  Calendar,
  MapPin,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import type { ListingDetail } from "@/lib/types/listing";
import type { ListingStatus, ListingCondition } from "@/lib/types/global";

interface ListingsTableProps {
  listings: ListingDetail[];
  isLoading?: boolean;
  onView?: (listing: ListingDetail) => void;
  onEdit?: (listing: ListingDetail) => void;
  onDelete?: (listing: ListingDetail) => void;
  onApprove?: (listing: ListingDetail) => void;
  onSuspend?: (listing: ListingDetail) => void;
  onPromote?: (listing: ListingDetail) => void;
  className?: string;
}

type SortField =
  | "title"
  | "price"
  | "status"
  | "createdAt"
  | "views"
  | "seller";
type SortDirection = "asc" | "desc";

interface TableFilters {
  search: string;
  status: ListingStatus | "all";
  condition: ListingCondition | "all";
  category: string;
  promoted: "all" | "promoted" | "not-promoted";
  verified: "all" | "verified" | "not-verified";
}

export function ListingsTable({
  listings,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onSuspend,
  onPromote,
  className,
}: ListingsTableProps) {
  const { t, i18n } = useTranslation(["admin", "common"]);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filters, setFilters] = useState<TableFilters>({
    search: "",
    status: "all",
    condition: "all",
    category: "all",
    promoted: "all",
    verified: "all",
  });

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const locale = i18n.language === "id" ? idLocale : enUS;
    return formatDistanceToNow(date, { addSuffix: true, locale });
  };

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

  const getStatusColor = (status: ListingStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "sold":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "expired":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getConditionColor = (condition: ListingCondition) => {
    switch (condition) {
      case "new":
        return "bg-green-100 text-green-800";
      case "like-new":
        return "bg-blue-100 text-blue-800";
      case "good":
        return "bg-yellow-100 text-yellow-800";
      case "fair":
        return "bg-orange-100 text-orange-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPromotionIcon = (type?: string) => {
    switch (type) {
      case "featured":
        return <Star className="h-3 w-3 text-yellow-600" />;
      case "urgent":
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case "highlight":
        return <Crown className="h-3 w-3 text-purple-600" />;
      default:
        return null;
    }
  };

  const filteredAndSortedListings = listings
    .filter((listing) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !listing.title.toLowerCase().includes(searchLower) &&
          !listing.seller.name.toLowerCase().includes(searchLower) &&
          !listing.location.city.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== "all" && listing.status !== filters.status) {
        return false;
      }

      // Condition filter
      if (
        filters.condition !== "all" &&
        listing.condition !== filters.condition
      ) {
        return false;
      }

      // Category filter
      if (
        filters.category !== "all" &&
        listing.category.id !== filters.category
      ) {
        return false;
      }

      // Promoted filter
      if (filters.promoted !== "all") {
        if (
          filters.promoted === "promoted" &&
          !listing.features.promoted.isPromoted
        )
          return false;
        if (
          filters.promoted === "not-promoted" &&
          listing.features.promoted.isPromoted
        )
          return false;
      }

      // Verified filter
      if (filters.verified !== "all") {
        if (filters.verified === "verified" && !listing.features.verified)
          return false;
        if (filters.verified === "not-verified" && listing.features.verified)
          return false;
      }

      return true;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "price":
          aValue = a.price.amount;
          bValue = b.price.amount;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "views":
          aValue = a.stats.views;
          bValue = b.stats.views;
          break;
        case "seller":
          aValue = a.seller.name.toLowerCase();
          bValue = b.seller.name.toLowerCase();
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
      setSelectedListings(filteredAndSortedListings.map((l) => l.id));
    } else {
      setSelectedListings([]);
    }
  };

  const handleSelectListing = (listingId: string, checked: boolean) => {
    if (checked) {
      setSelectedListings([...selectedListings, listingId]);
    } else {
      setSelectedListings(selectedListings.filter((id) => id !== listingId));
    }
  };

  const isAllSelected =
    selectedListings.length === filteredAndSortedListings.length &&
    filteredAndSortedListings.length > 0;
  const isPartiallySelected =
    selectedListings.length > 0 &&
    selectedListings.length < filteredAndSortedListings.length;

  // Get unique categories for filter
  const categories = Array.from(new Set(listings.map((l) => l.category.id)))
    .map((id) => listings.find((l) => l.category.id === id)?.category)
    .filter(Boolean);

  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-8 w-64 bg-muted rounded animate-pulse" />
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
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
              placeholder={t("listings.search_placeholder")}
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
                {t("listings.status.active")}
              </SelectItem>
              <SelectItem value="draft">
                {t("listings.status.draft")}
              </SelectItem>
              <SelectItem value="sold">{t("listings.status.sold")}</SelectItem>
              <SelectItem value="expired">
                {t("listings.status.expired")}
              </SelectItem>
              <SelectItem value="suspended">
                {t("listings.status.suspended")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.condition}
            onValueChange={(value: any) =>
              setFilters({ ...filters, condition: value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="new">{t("listings.condition.new")}</SelectItem>
              <SelectItem value="like-new">
                {t("listings.condition.like-new")}
              </SelectItem>
              <SelectItem value="good">
                {t("listings.condition.good")}
              </SelectItem>
              <SelectItem value="fair">
                {t("listings.condition.fair")}
              </SelectItem>
              <SelectItem value="poor">
                {t("listings.condition.poor")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.category}
            onValueChange={(value) =>
              setFilters({ ...filters, category: value })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all_categories")}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category!.id} value={category!.id}>
                  {category!.name.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedListings.length > 0 && (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm text-blue-800 dark:text-blue-200">
            {t("listings.selected_count", { count: selectedListings.length })}
          </span>
          <Button variant="outline" size="sm">
            {t("common.bulk_approve")}
          </Button>
          <Button variant="outline" size="sm">
            {t("common.bulk_suspend")}
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
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("listings.table.listing")}</span>
                  {getSortIcon("title")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("seller")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("listings.table.seller")}</span>
                  {getSortIcon("seller")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("price")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("listings.table.price")}</span>
                  {getSortIcon("price")}
                </div>
              </TableHead>
              <TableHead>{t("listings.table.category")}</TableHead>
              <TableHead>{t("listings.table.status")}</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("views")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("listings.table.views")}</span>
                  {getSortIcon("views")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("listings.table.created")}</span>
                  {getSortIcon("createdAt")}
                </div>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedListings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <Package className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {Object.values(filters).some(
                        (v) => v !== "all" && v !== ""
                      )
                        ? t("listings.no_results")
                        : t("listings.no_listings")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedListings.map((listing) => (
                <TableRow key={listing.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedListings.includes(listing.id)}
                      onCheckedChange={(checked) =>
                        handleSelectListing(listing.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start space-x-3">
                      {listing.images.length > 0 && (
                        <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-lg overflow-hidden">
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start space-x-2">
                          <p className="font-medium truncate">
                            {listing.title}
                          </p>
                          <div className="flex items-center space-x-1">
                            {listing.features.promoted.isPromoted && (
                              <div className="flex items-center space-x-1">
                                {getPromotionIcon(
                                  listing.features.promoted.type
                                )}
                              </div>
                            )}
                            {listing.features.verified && (
                              <CheckSquare className="h-3 w-3 text-green-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              getConditionColor(listing.condition)
                            )}
                          >
                            {t(`listings.condition.${listing.condition}`)}
                          </Badge>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{listing.location.city}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={listing.seller.avatar}
                          alt={listing.seller.name}
                        />
                        <AvatarFallback className="text-xs">
                          {listing.seller.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {listing.seller.name}
                        </p>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>{listing.seller.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        {formatCurrency(
                          listing.price.amount,
                          listing.price.currency
                        )}
                      </span>
                      {listing.price.negotiable && (
                        <Badge variant="outline" className="text-xs">
                          {t("listings.negotiable")}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {listing.category.name.en}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={cn(
                          "text-xs",
                          getStatusColor(listing.status)
                        )}
                      >
                        {t(`listings.status.${listing.status}`)}
                      </Badge>
                      {listing.features.promoted.isPromoted && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-purple-100 text-purple-800"
                        >
                          {t(
                            `listings.promotion.${listing.features.promoted.type}`
                          )}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{listing.stats.views}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatTimeAgo(listing.createdAt)}</span>
                      </div>
                    </div>
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
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(listing)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t("common.view")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() =>
                            window.open(`/listings/${listing.id}`, "_blank")
                          }
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t("common.view_public")}
                        </DropdownMenuItem>
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(listing)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                        )}
                        {onPromote && listing.status === "active" && (
                          <DropdownMenuItem onClick={() => onPromote(listing)}>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            {t("listings.promote")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {onApprove && listing.status === "draft" && (
                          <DropdownMenuItem onClick={() => onApprove(listing)}>
                            <CheckSquare className="h-4 w-4 mr-2" />
                            {t("listings.approve")}
                          </DropdownMenuItem>
                        )}
                        {onSuspend && listing.status === "active" && (
                          <DropdownMenuItem onClick={() => onSuspend(listing)}>
                            <Ban className="h-4 w-4 mr-2" />
                            {t("listings.suspend")}
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(listing)}
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
          {t("listings.showing_results", {
            start: filteredAndSortedListings.length > 0 ? 1 : 0,
            end: filteredAndSortedListings.length,
            total: listings.length,
          })}
        </div>
        {selectedListings.length > 0 && (
          <div>
            {t("listings.selected_count", { count: selectedListings.length })}
          </div>
        )}
      </div>
    </div>
  );
}
