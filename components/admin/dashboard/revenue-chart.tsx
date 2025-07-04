"use client";

import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { Calendar, Download, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface RevenueData {
  period: string;
  revenue: number;
  subscriptions: number;
  promotions: number;
  featuredListings: number;
  refunds: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  isLoading?: boolean;
  className?: string;
  onPeriodChange?: (period: string) => void;
  onExport?: () => void;
}

type ChartType = "area" | "line" | "bar";
type TimePeriod = "7d" | "30d" | "90d" | "1y";

export function RevenueChart({
  data,
  isLoading = false,
  className,
  onPeriodChange,
  onExport,
}: RevenueChartProps) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED
  const [chartType, setChartType] = useState<ChartType>("area");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30d");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTooltipValue = (value: number, name: string) => {
    return [formatCurrency(value), t(`payments.types.${name}`) || name];
  };

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground mb-2">
            {new Date(label).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
          {payload.map((entry: any) => (
            <div
              key={entry.dataKey}
              className="flex items-center justify-between space-x-4"
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {t(`revenue.breakdown.${entry.dataKey}`) || entry.dataKey}
                </span>
              </div>
              <span className="font-medium text-foreground">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
          <div className="border-t border-border mt-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">
                {t("revenue.total")}
              </span>
              <span className="font-bold text-foreground">
                {formatCurrency(
                  payload.reduce(
                    (sum: number, entry: any) => sum + entry.value,
                    0
                  )
                )}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
    onPeriodChange?.(period);
  };

  const calculateTotal = () => {
    return data.reduce((sum, item) => sum + item.revenue, 0);
  };

  const calculateGrowth = () => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1]?.revenue || 0;
    const previous = data[data.length - 2]?.revenue || 0;
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="period"
              tickFormatter={formatXAxisLabel}
              className="text-muted-foreground"
            />
            <YAxis
              tickFormatter={formatCurrency}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              fill="url(#revenueGradient)"
              strokeWidth={2}
              name="Total Revenue"
            />
          </AreaChart>
        );

      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="period"
              tickFormatter={formatXAxisLabel}
              className="text-muted-foreground"
            />
            <YAxis
              tickFormatter={formatCurrency}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="subscriptions"
              stroke="#10b981"
              strokeWidth={2}
              name="Subscriptions"
            />
            <Line
              type="monotone"
              dataKey="promotions"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Promotions"
            />
            <Line
              type="monotone"
              dataKey="featuredListings"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Featured Listings"
            />
          </LineChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="period"
              tickFormatter={formatXAxisLabel}
              className="text-muted-foreground"
            />
            <YAxis
              tickFormatter={formatCurrency}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="subscriptions" fill="#10b981" name="Subscriptions" />
            <Bar dataKey="promotions" fill="#f59e0b" name="Promotions" />
            <Bar
              dataKey="featuredListings"
              fill="#8b5cf6"
              name="Featured Listings"
            />
          </BarChart>
        );
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-10 w-24 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const growth = calculateGrowth();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">
              {t("revenue.chart.title")}
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>
                {t("revenue.total_revenue")}: {formatCurrency(calculateTotal())}
              </span>
              <div className="flex items-center space-x-1">
                <TrendingUp
                  className={cn(
                    "h-4 w-4",
                    growth >= 0 ? "text-green-600" : "text-red-600"
                  )}
                />
                <span
                  className={cn(
                    "font-medium",
                    growth >= 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {growth > 0 ? "+" : ""}
                  {growth.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timePeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">{t("analytics.last_7_days")}</SelectItem>
                <SelectItem value="30d">
                  {t("analytics.last_30_days")}
                </SelectItem>
                <SelectItem value="90d">
                  {t("analytics.last_90_days")}
                </SelectItem>
                <SelectItem value="1y">{t("analytics.last_year")}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={chartType}
              onValueChange={(value: ChartType) => setChartType(value)}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">{t("common.area")}</SelectItem>
                <SelectItem value="line">{t("common.line")}</SelectItem>
                <SelectItem value="bar">{t("common.bar")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              {t("common.export")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
