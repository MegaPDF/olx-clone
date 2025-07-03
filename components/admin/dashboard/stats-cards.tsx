"use client";

import { useTranslation } from "next-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminDashboardStats } from "@/lib/types";

interface StatsCardsProps {
  stats: AdminDashboardStats;
  isLoading?: boolean;
  className?: string;
}

interface StatCard {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: "up" | "down" | "neutral";
  color: "default" | "success" | "warning" | "destructive";
}

export function StatsCards({
  stats,
  isLoading = false,
  className,
}: StatsCardsProps) {
  const { t } = useTranslation("admin");

  if (isLoading) {
    return (
      <div
        className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-1" />
              <div className="h-3 w-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const statCards: StatCard[] = [
    {
      title: t("dashboard.stats.total_users"),
      value: formatNumber(stats.users.total),
      change: stats.users.growth,
      changeLabel: t("dashboard.stats.from_last_month"),
      icon: Users,
      trend:
        stats.users.growth > 0
          ? "up"
          : stats.users.growth < 0
          ? "down"
          : "neutral",
      color: "default",
    },
    {
      title: t("dashboard.stats.active_listings"),
      value: formatNumber(stats.listings.active),
      change: stats.listings.growth,
      changeLabel: t("dashboard.stats.from_last_month"),
      icon: Package,
      trend:
        stats.listings.growth > 0
          ? "up"
          : stats.listings.growth < 0
          ? "down"
          : "neutral",
      color: "success",
    },
    {
      title: t("dashboard.stats.monthly_revenue"),
      value: formatCurrency(stats.revenue.thisMonth),
      change: stats.revenue.growth,
      changeLabel: t("dashboard.stats.from_last_month"),
      icon: DollarSign,
      trend:
        stats.revenue.growth > 0
          ? "up"
          : stats.revenue.growth < 0
          ? "down"
          : "neutral",
      color: stats.revenue.growth > 0 ? "success" : "warning",
    },
    {
      title: t("dashboard.stats.pending_reports"),
      value: formatNumber(stats.activity.pendingReports),
      change:
        (stats.activity.pendingReports / Math.max(stats.activity.reports, 1) -
          1) *
        100,
      changeLabel: t("dashboard.stats.from_total_reports"),
      icon: AlertCircle,
      trend: stats.activity.pendingReports > 5 ? "up" : "neutral",
      color: stats.activity.pendingReports > 10 ? "destructive" : "default",
    },
  ];

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "neutral", change: number) => {
    if (trend === "neutral") return "text-muted-foreground";
    if (trend === "up") return "text-green-600";
    return "text-red-600";
  };

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon
                className={cn(
                  "h-4 w-4",
                  card.color === "success" && "text-green-600",
                  card.color === "warning" && "text-yellow-600",
                  card.color === "destructive" && "text-red-600",
                  card.color === "default" && "text-blue-600"
                )}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                {getTrendIcon(card.trend)}
                <span className={getTrendColor(card.trend, card.change)}>
                  {formatPercentage(card.change)}
                </span>
                <span className="text-muted-foreground">
                  {card.changeLabel}
                </span>
              </div>
              {/* Status indicator for reports */}
              {index === 3 && (
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      stats.activity.pendingReports > 10
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {stats.activity.pendingReports > 10
                      ? t("common.urgent")
                      : t("common.normal")}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
