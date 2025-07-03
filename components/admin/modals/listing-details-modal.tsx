"use client";

import { useTranslation } from "next-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Package,
  User,
  MapPin,
  Calendar,
  Eye,
  Heart,
  MessageSquare,
  Share,
  Star,
  Crown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  MoreVertical,
  ExternalLink,
  Edit,
  Trash2,
  Ban,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import type { ListingDetail } from "@/lib/types/listing";
import type { ListingStatus, ListingCondition } from "@/lib/types/global";

interface ListingDetailsModalProps {
  listing?: ListingDetail;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (listing: ListingDetail) => void;
  onDelete?: (listing: ListingDetail) => void;
  onSuspend?: (listing: ListingDetail) => void;
  onApprove?: (listing: ListingDetail) => void;
  onPromote?: (listing: ListingDetail) => void;
  className?: string;
}

export function ListingDetailsModal({
  listing,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onSuspend,
  onApprove,
  onPromote,
  className,
}: ListingDetailsModalProps) {
  const { t, i18n } = useTranslation(["admin", "common"]);

  if (!listing) return null;

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
        return <Star className="h-4 w-4 text-yellow-600" />;
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "highlight":
        return <Crown className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-4xl max-h-[90vh]", className)}>
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span>{listing.title}</span>
                {listing.features.promoted.isPromoted && (
                  <div className="flex items-center space-x-1">
                    {getPromotionIcon(listing.features.promoted.type)}
                    <Badge variant="secondary" className="text-xs">
                      {t(
                        `listings.promotion.${listing.features.promoted.type}`
                      )}
                    </Badge>
                  </div>
                )}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {t("listings.created")} {formatTimeAgo(listing.createdAt)} •{" "}
                {t("listings.id")}: {listing.id}
              </DialogDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
                    <Star className="h-4 w-4 mr-2" />
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
          </div>

          {/* Status and Badges */}
          <div className="flex items-center space-x-2">
            <Badge className={cn("text-xs", getStatusColor(listing.status))}>
              {t(`listings.status.${listing.status}`)}
            </Badge>
            <Badge
              variant="outline"
              className={cn("text-xs", getConditionColor(listing.condition))}
            >
              {t(`listings.condition.${listing.condition}`)}
            </Badge>
            {listing.features.verified && (
              <Badge
                variant="secondary"
                className="text-xs bg-green-100 text-green-800"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                {t("listings.verified")}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Images */}
            {listing.images.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">{t("listings.images")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {listing.images.slice(0, 6).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                    >
                      <img
                        src={image}
                        alt={`${listing.title} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === 5 && listing.images.length > 6 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            +{listing.images.length - 6} {t("common.more")}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Price and Basic Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">
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
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {t("listings.category")}
                      </p>
                      <p className="font-medium">{listing.category.name.en}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">
                    {t("listings.description")}
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {listing.description}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{t("listings.location")}</span>
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    <p>{listing.location.address}</p>
                    <p>
                      {listing.location.city}, {listing.location.state}
                    </p>
                    <p>{listing.location.country}</p>
                  </div>
                </div>

                {/* SEO Information */}
                {listing.seo && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">
                      {t("listings.seo_info")}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          {t("listings.slug")}:{" "}
                        </span>
                        <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                          {listing.seo.slug}
                        </span>
                      </div>
                      {listing.seo.metaTitle && (
                        <div>
                          <span className="text-muted-foreground">
                            {t("listings.meta_title")}:{" "}
                          </span>
                          <span>{listing.seo.metaTitle}</span>
                        </div>
                      )}
                      {listing.seo.metaDescription && (
                        <div>
                          <span className="text-muted-foreground">
                            {t("listings.meta_description")}:{" "}
                          </span>
                          <span>{listing.seo.metaDescription}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Seller Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{t("listings.seller")}</span>
                  </h3>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage
                        src={listing.seller.avatar}
                        alt={listing.seller.name}
                      />
                      <AvatarFallback>
                        {listing.seller.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{listing.seller.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>{listing.seller.rating.toFixed(1)}</span>
                        </div>
                        <span>•</span>
                        <span>
                          {listing.seller.reviewCount} {t("listings.reviews")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("listings.member_since")}{" "}
                        {new Date(listing.seller.memberSince).getFullYear()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">
                    {t("listings.statistics")}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Eye className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                      <p className="text-lg font-semibold">
                        {listing.stats.views}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("listings.views")}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Heart className="h-4 w-4 mx-auto mb-1 text-red-600" />
                      <p className="text-lg font-semibold">
                        {listing.stats.favorites}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("listings.favorites")}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <MessageSquare className="h-4 w-4 mx-auto mb-1 text-green-600" />
                      <p className="text-lg font-semibold">
                        {listing.stats.contacts}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("listings.contacts")}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Share className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                      <p className="text-lg font-semibold">
                        {listing.stats.shares}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("listings.shares")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Promotion Details */}
                {listing.features.promoted.isPromoted && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center space-x-2">
                      <Crown className="h-4 w-4 text-purple-600" />
                      <span>{t("listings.promotion_details")}</span>
                    </h3>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t("listings.type")}</span>
                        <Badge variant="secondary" className="text-xs">
                          {t(
                            `listings.promotion.${listing.features.promoted.type}`
                          )}
                        </Badge>
                      </div>
                      {listing.features.promoted.expiresAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {t("listings.expires")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(listing.features.promoted.expiresAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{t("listings.dates")}</span>
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("listings.created")}
                      </span>
                      <span>
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("listings.updated")}
                      </span>
                      <span>
                        {new Date(listing.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("listings.expires")}
                      </span>
                      <span
                        className={cn(
                          new Date(listing.expiresAt) < new Date()
                            ? "text-red-600"
                            : "",
                          new Date(listing.expiresAt).getTime() -
                            new Date().getTime() <
                            7 * 24 * 60 * 60 * 1000
                            ? "text-yellow-600"
                            : ""
                        )}
                      >
                        {new Date(listing.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
