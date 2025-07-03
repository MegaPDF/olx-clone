"use client";

import { JSX, useState } from "react";
import { useTranslation } from "next-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  MapPin,
  Eye,
  Star,
  Zap,
  Shield,
  MessageSquare,
  Share2,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import { LocalizedLink } from "@/components/i18n/localized-link";
import { useAuth } from "@/lib/hooks/use-auth";
import type { ListingCard } from "@/lib/types";

interface ListingCardProps {
  listing: ListingCard;
  onFavorite?: (listingId: string) => void;
  onShare?: (listing: ListingCard) => void;
  onContact?: (listingId: string) => void;
  variant?: "default" | "compact" | "featured";
  showSeller?: boolean;
  className?: string;
}

export function ListingCard({
  listing,
  onFavorite,
  onShare,
  onContact,
  variant = "default",
  showSeller = true,
  className,
}: ListingCardProps) {
  const { t, i18n } = useTranslation(["listings", "common"]);
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const formatPrice = (price: typeof listing.price) => {
    const formatter = new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: price.currency,
      minimumFractionDigits: 0,
    });
    return formatter.format(price.amount);
  };

  const formatTimeAgo = (date: Date) => {
    const locale = i18n.language === "id" ? idLocale : enUS;
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale });
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !onFavorite) return;

    setFavoriteLoading(true);
    try {
      await onFavorite(listing.id);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(listing);
  };

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContact?.(listing.id);
  };

  const getConditionBadge = () => {
    const conditionColors = {
      new: "bg-green-100 text-green-800 border-green-200",
      "like-new": "bg-blue-100 text-blue-800 border-blue-200",
      good: "bg-emerald-100 text-emerald-800 border-emerald-200",
      fair: "bg-yellow-100 text-yellow-800 border-yellow-200",
      poor: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <Badge
        variant="outline"
        className={cn("text-xs", conditionColors[listing.condition])}
      >
        {t(`listings:condition.${listing.condition}`)}
      </Badge>
    );
  };

  const promotionBadges = () => {
    const badges: JSX.Element[] = [];

    if (listing.features.promoted.isPromoted) {
      const type = listing.features.promoted.type;

      if (type === "featured") {
        badges.push(
          <Badge key="featured" className="bg-yellow-500 text-white">
            <Star className="h-3 w-3 mr-1" />
            {t("listings:featured")}
          </Badge>
        );
      } else if (type === "urgent") {
        badges.push(
          <Badge key="urgent" className="bg-red-500 text-white">
            <Zap className="h-3 w-3 mr-1" />
            {t("listings:urgent")}
          </Badge>
        );
      }
    }

    if (listing.features.verified) {
      badges.push(
        <Badge
          key="verified"
          variant="secondary"
          className="bg-blue-100 text-blue-800"
        >
          <Shield className="h-3 w-3 mr-1" />
          {t("listings:verified")}
        </Badge>
      );
    }

    return badges;
  };

  if (variant === "compact") {
    return (
      <LocalizedLink href={`/listings/${listing.id}`}>
        <Card
          className={cn(
            "group cursor-pointer hover:shadow-lg transition-all",
            className
          )}
        >
          <CardContent className="p-3">
            <div className="flex gap-3">
              <div className="relative w-20 h-20 flex-shrink-0">
                <img
                  src={
                    imageError
                      ? "/images/placeholder-listing.jpg"
                      : listing.images[0]
                  }
                  alt={listing.title}
                  className="w-full h-full object-cover rounded-md"
                  onError={() => setImageError(true)}
                />
                {listing.features.promoted.isPromoted && (
                  <div className="absolute -top-1 -right-1">
                    {listing.features.promoted.type === "featured" && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    {listing.features.promoted.type === "urgent" && (
                      <Zap className="h-4 w-4 text-red-500 fill-current" />
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary">
                  {listing.title}
                </h3>
                <p className="text-lg font-bold text-primary mt-1">
                  {formatPrice(listing.price)}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{listing.location.city}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(listing.createdAt)}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleFavorite}
                  disabled={favoriteLoading}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      listing.isFavorited && "fill-current text-red-500"
                    )}
                  />
                </Button>
                {getConditionBadge()}
              </div>
            </div>
          </CardContent>
        </Card>
      </LocalizedLink>
    );
  }

  return (
    <LocalizedLink href={`/listings/${listing.id}`}>
      <Card
        className={cn(
          "group cursor-pointer hover:shadow-lg transition-all overflow-hidden",
          variant === "featured" && "ring-2 ring-yellow-200 shadow-lg",
          className
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={
              imageError ? "/images/placeholder-listing.jpg" : listing.images[0]
            }
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />

          {/* Overlay badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {promotionBadges()}
          </div>

          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              onClick={handleFavorite}
              disabled={favoriteLoading}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  listing.isFavorited && "fill-current text-red-500"
                )}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  {t("common:share")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleContact}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t("listings:contact")}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`/listings/${listing.id}`} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t("common:openInNewTab")}
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats overlay */}
          <div className="absolute bottom-2 left-2 flex items-center gap-2 text-white text-xs">
            <div className="flex items-center gap-1 bg-black/50 rounded px-2 py-1">
              <Eye className="h-3 w-3" />
              <span>{listing.stats.views}</span>
            </div>
            <div className="flex items-center gap-1 bg-black/50 rounded px-2 py-1">
              <Heart className="h-3 w-3" />
              <span>{listing.stats.favorites}</span>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
              <p className="text-2xl font-bold text-primary mt-1">
                {formatPrice(listing.price)}
              </p>
            </div>

            <div className="flex items-center justify-between">
              {getConditionBadge()}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {listing.location.city}, {listing.location.state}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatTimeAgo(listing.createdAt)}</span>

              {showSeller && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={listing.seller?.avatar} />
                    <AvatarFallback>{listing.seller?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{listing.seller?.name}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </LocalizedLink>
  );
}
