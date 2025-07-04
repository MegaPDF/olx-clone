"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  Share2,
  MapPin,
  Calendar,
  Eye,
  Star,
  Shield,
  Zap,
  MessageSquare,
  Phone,
  Mail,
  Flag,
  Clock,
  Package,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
import { LocalizedLink } from "@/components/i18n/localized-link";
import { ListingImages } from "./listing-images";
import type { ListingDetail } from "@/lib/types";

interface ListingDetailProps {
  listing: ListingDetail;
  onFavorite?: (listingId: string) => void;
  onShare?: () => void;
  onContact?: () => void;
  onReport?: () => void;
  className?: string;
}

export function ListingDetail({
  listing,
  onFavorite,
  onShare,
  onContact,
  onReport,
  className,
}: ListingDetailProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { user } = useAuth();
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const formatPrice = (price: typeof listing.price) => {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: price.currency,
      minimumFractionDigits: 0,
    });
    return formatter.format(price.amount);
  };

  const formatTimeAgo = (date: Date) => {
    const dateFnsLocale = locale === "id" ? idLocale : enUS;
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: dateFnsLocale });
  };

  const handleFavorite = async () => {
    if (!user || !onFavorite) return;

    setFavoriteLoading(true);
    try {
      await onFavorite(listing.id);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const getConditionConfig = () => {
    const config = {
      new: { icon: Package, color: "text-green-600", bg: "bg-green-100" },
      "like-new": { icon: Star, color: "text-blue-600", bg: "bg-blue-100" },
      good: {
        icon: CheckCircle,
        color: "text-emerald-600",
        bg: "bg-emerald-100",
      },
      fair: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
      poor: { icon: Flag, color: "text-red-600", bg: "bg-red-100" },
    };

    return config[listing.condition];
  };

  const conditionConfig = getConditionConfig();
  const ConditionIcon = conditionConfig.icon;

  return (
    <div
      className={cn(
        "max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6",
        className
      )}
    >
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Images */}
        <ListingImages images={listing.images} title={listing.title} />

        {/* Title and Price */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold">
                {listing.title}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                {listing.features.promoted.isPromoted && (
                  <>
                    {listing.features.promoted.type === "featured" && (
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        {t("listings:featured")}
                      </Badge>
                    )}
                    {listing.features.promoted.type === "urgent" && (
                      <Badge className="bg-red-500 text-white">
                        <Zap className="h-3 w-3 mr-1" />
                        {t("listings:urgent")}
                      </Badge>
                    )}
                  </>
                )}
                {listing.features.verified && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {t("listings:verified")}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="h-4 w-4 mr-2" />
                {t("common:share")}
              </Button>

              <Button
                variant={listing.isFavorited ? "default" : "outline"}
                size="sm"
                onClick={handleFavorite}
                disabled={favoriteLoading}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 mr-2",
                    listing.isFavorited && "fill-current"
                  )}
                />
                {listing.isFavorited
                  ? t("common:favorited")
                  : t("common:favorite")}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-primary">
              {formatPrice(listing.price)}
              {listing.price.negotiable && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {t("listings:negotiable")}
                </span>
              )}
            </div>

            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full",
                conditionConfig.bg
              )}
            >
              <ConditionIcon className={cn("h-4 w-4", conditionConfig.color)} />
              <span className={cn("font-medium", conditionConfig.color)}>
                {t(`listings:condition.${listing.condition}`)}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>{t("listings:description")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{listing.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>{t("listings:details")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("listings:condition.label")}
                  </p>
                  <p className="font-medium">
                    {t(`listings:condition.${listing.condition}`)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("listings:location")}
                  </p>
                  <p className="font-medium">
                    {listing.location.city}, {listing.location.state}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("listings:posted")}
                  </p>
                  <p className="font-medium">
                    {formatTimeAgo(listing.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("listings:views")}
                  </p>
                  <p className="font-medium">
                    {listing.stats.views.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {t("listings:listingId")}: {listing.id}
              </span>
              <Button variant="ghost" size="sm" onClick={onReport}>
                <Flag className="h-4 w-4 mr-2" />
                {t("common:report")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Contact Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("listings:contactSeller")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={listing.seller.avatar} />
                <AvatarFallback>{listing.seller.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{listing.seller.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                  <span>{listing.seller.rating}</span>
                  <span>
                    ({listing.seller.reviewCount} {t("common:reviews")})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("listings:memberSince")}{" "}
                  {new Date(listing.seller.memberSince).getFullYear()}
                </p>
              </div>
            </div>

            {!listing.isOwner && (
              <div className="space-y-2">
                <Button className="w-full" onClick={onContact}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t("listings:sendMessage")}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    {t("listings:call")}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    {t("listings:email")}
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            <div className="text-center">
              <LocalizedLink
                href={`/users/${listing.seller.id}`}
                className="text-sm text-primary hover:underline"
              >
                {t("listings:viewProfile")}
                <ExternalLink className="h-3 w-3 ml-1 inline" />
              </LocalizedLink>
            </div>
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              {t("listings:safetyTips")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• {t("listings:tip1")}</li>
              <li>• {t("listings:tip2")}</li>
              <li>• {t("listings:tip3")}</li>
              <li>• {t("listings:tip4")}</li>
            </ul>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{listing.stats.views}</p>
                <p className="text-sm text-muted-foreground">
                  {t("listings:views")}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold">{listing.stats.favorites}</p>
                <p className="text-sm text-muted-foreground">
                  {t("listings:favorites")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
