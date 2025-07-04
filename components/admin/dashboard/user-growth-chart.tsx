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
  ComposedChart,
  Bar,
} from "recharts";
import { Users, UserPlus, TrendingUp, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface UserGrowthData {
  period: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  churnRate: number;
}

interface UserGrowthChartProps {
  data: UserGrowthData[];
  isLoading?: boolean;
  className?: string;
  onPeriodChange?: (period: string) => void;
  onExport?: () => void;
}

type ChartType = "area" | "line" | "composed";
type TimePeriod = "7d" | "30d" | "90d" | "1y";

export function UserGrowthChart({
  data,
  isLoading = false,
  className,
  onPeriodChange,
  onExport,
}: UserGrowthChartProps) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED
  const [chartType, setChartType] = useState<ChartType>("area");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30d");

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K";
    }
    return value.toString();
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
                  {t(`users.stats.${entry.dataKey}`) || entry.dataKey}
                </span>
              </div>
              <span className="font-medium text-foreground">
                {entry.dataKey === "churnRate"
                  ? `${entry.value.toFixed(1)}%`
                  : formatNumber(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
    onPeriodChange?.(period);
  };

  const calculateMetrics = () => {
    if (data.length === 0)
      return { totalGrowth: 0, avgNewUsers: 0, avgChurnRate: 0 };

    const latest = data[data.length - 1];
    const earliest = data[0];

    const totalGrowth =
      earliest.totalUsers > 0
        ? ((latest.totalUsers - earliest.totalUsers) / earliest.totalUsers) *
          100
        : 0;

    const avgNewUsers =
      data.reduce((sum, item) => sum + item.newUsers, 0) / data.length;
    const avgChurnRate =
      data.reduce((sum, item) => sum + item.churnRate, 0) / data.length;

    return { totalGrowth, avgNewUsers, avgChurnRate };
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
              <linearGradient
                id="totalUsersGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="activeUsersGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="period"
              tickFormatter={formatXAxisLabel}
              className="text-muted-foreground"
            />
            <YAxis
              tickFormatter={formatNumber}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="totalUsers"
              stroke="#3b82f6"
              fill="url(#totalUsersGradient)"
              strokeWidth={2}
              name="Total Users"
            />
            <Area
              type="monotone"
              dataKey="activeUsers"
              stroke="#10b981"
              fill="url(#activeUsersGradient)"
              strokeWidth={2}
              name="Active Users"
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
              tickFormatter={formatNumber}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalUsers"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Total Users"
            />
            <Line
              type="monotone"
              dataKey="activeUsers"
              stroke="#10b981"
              strokeWidth={2}
              name="Active Users"
            />
            <Line
              type="monotone"
              dataKey="newUsers"
              stroke="#f59e0b"
              strokeWidth={2}
              name="New Users"
            />
          </LineChart>
        );

      case "composed":
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="period"
              tickFormatter={formatXAxisLabel}
              className="text-muted-foreground"
            />
            <YAxis
              yAxisId="users"
              tickFormatter={formatNumber}
              className="text-muted-foreground"
            />
            <YAxis
              yAxisId="rate"
              orientation="right"
              tickFormatter={(value) => `${value}%`}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              yAxisId="users"
              type="monotone"
              dataKey="totalUsers"
              fill="#3b82f6"
              fillOpacity={0.3}
              stroke="#3b82f6"
              strokeWidth={2}
              name="Total Users"
            />
            <Bar
              yAxisId="users"
              dataKey="newUsers"
              fill="#10b981"
              name="New Users"
            />
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="churnRate"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444" }}
              name="Churn Rate (%)"
            />
          </ComposedChart>
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

  const metrics = calculateMetrics();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>{t("users.growth.title")}</span>
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <TrendingUp
                  className={cn(
                    "h-4 w-4",
                    metrics.totalGrowth >= 0 ? "text-green-600" : "text-red-600"
                  )}
                />
                <span
                  className={cn(
                    "font-medium",
                    metrics.totalGrowth >= 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {metrics.totalGrowth > 0 ? "+" : ""}
                  {metrics.totalGrowth.toFixed(1)}%
                </span>
                <span>{t("users.growth.total_growth")}</span>
              </div>
              <div className="flex items-center space-x-1">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <span className="font-medium">
                  {formatNumber(metrics.avgNewUsers)}
                </span>
                <span>{t("users.growth.avg_new_users")}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium text-yellow-600">
                  {metrics.avgChurnRate.toFixed(1)}%
                </span>
                <span>{t("users.growth.avg_churn_rate")}</span>
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
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">{t("common.area")}</SelectItem>
                <SelectItem value="line">{t("common.line")}</SelectItem>
                <SelectItem value="composed">{t("common.combined")}</SelectItem>
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
