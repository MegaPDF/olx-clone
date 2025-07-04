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
  Eye,
  Download,
  RefreshCw,
  XCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CreditCard,
  DollarSign,
  Star,
  Zap,
  Crown,
  Package,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import type { PaymentDetail } from "@/lib/types/payment";
import type { PaymentStatus } from "@/lib/types/global";

interface PaymentsTableProps {
  payments: PaymentDetail[];
  isLoading?: boolean;
  onView?: (payment: PaymentDetail) => void;
  onRefund?: (payment: PaymentDetail) => void;
  onRetry?: (payment: PaymentDetail) => void;
  onDownloadInvoice?: (payment: PaymentDetail) => void;
  className?: string;
}

type SortField = "createdAt" | "amount" | "status" | "user" | "type";
type SortDirection = "asc" | "desc";

interface TableFilters {
  search: string;
  status: PaymentStatus | "all";
  type: "all" | "promotion" | "subscription" | "featured_listing";
  dateRange: "all" | "today" | "week" | "month" | "quarter";
  amountRange: "all" | "0-10" | "10-50" | "50-100" | "100+";
}

export function PaymentsTable({
  payments,
  isLoading = false,
  onView,
  onRefund,
  onRetry,
  onDownloadInvoice,
  className,
}: PaymentsTableProps) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filters, setFilters] = useState<TableFilters>({
    search: "",
    status: "all",
    type: "all",
    dateRange: "all",
    amountRange: "all",
  });

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const locale = locale === "id" ? idLocale : enUS;
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

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "refunded":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "pending":
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case "failed":
        return <XCircle className="h-3 w-3 text-red-600" />;
      case "refunded":
        return <RefreshCw className="h-3 w-3 text-purple-600" />;
      case "cancelled":
        return <XCircle className="h-3 w-3 text-gray-600" />;
      default:
        return <AlertTriangle className="h-3 w-3 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "promotion":
        return <Star className="h-4 w-4 text-yellow-600" />;
      case "subscription":
        return <Crown className="h-4 w-4 text-purple-600" />;
      case "featured_listing":
        return <Zap className="h-4 w-4 text-orange-600" />;
      default:
        return <Package className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPromotionTypeIcon = (promotionType?: string) => {
    switch (promotionType) {
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

  const filteredAndSortedPayments = payments
    .filter((payment) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !payment.user.name.toLowerCase().includes(searchLower) &&
          !payment.user.email.toLowerCase().includes(searchLower) &&
          !payment.provider.transactionId.toLowerCase().includes(searchLower) &&
          !payment.invoice.number.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== "all" && payment.status !== filters.status) {
        return false;
      }

      // Type filter
      if (filters.type !== "all" && payment.type !== filters.type) {
        return false;
      }

      // Date range filter
      if (filters.dateRange !== "all") {
        const now = new Date();
        const paymentDate = new Date(payment.createdAt);
        const diffTime = now.getTime() - paymentDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);

        switch (filters.dateRange) {
          case "today":
            if (diffDays > 1) return false;
            break;
          case "week":
            if (diffDays > 7) return false;
            break;
          case "month":
            if (diffDays > 30) return false;
            break;
          case "quarter":
            if (diffDays > 90) return false;
            break;
        }
      }

      // Amount range filter
      if (filters.amountRange !== "all") {
        const amount = payment.amount.value;
        switch (filters.amountRange) {
          case "0-10":
            if (amount >= 10) return false;
            break;
          case "10-50":
            if (amount < 10 || amount >= 50) return false;
            break;
          case "50-100":
            if (amount < 50 || amount >= 100) return false;
            break;
          case "100+":
            if (amount < 100) return false;
            break;
        }
      }

      return true;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "amount":
          aValue = a.amount.value;
          bValue = b.amount.value;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "user":
          aValue = a.user.name.toLowerCase();
          bValue = b.user.name.toLowerCase();
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
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
      setSelectedPayments(filteredAndSortedPayments.map((p) => p.id));
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectPayment = (paymentId: string, checked: boolean) => {
    if (checked) {
      setSelectedPayments([...selectedPayments, paymentId]);
    } else {
      setSelectedPayments(selectedPayments.filter((id) => id !== paymentId));
    }
  };

  const isAllSelected =
    selectedPayments.length === filteredAndSortedPayments.length &&
    filteredAndSortedPayments.length > 0;
  const isPartiallySelected =
    selectedPayments.length > 0 &&
    selectedPayments.length < filteredAndSortedPayments.length;

  // Calculate totals
  const totalAmount = filteredAndSortedPayments.reduce(
    (sum, payment) => sum + payment.amount.value,
    0
  );
  const completedAmount = filteredAndSortedPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, payment) => sum + payment.amount.value, 0);

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
              placeholder={t("payments.search_placeholder")}
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
              <SelectItem value="completed">
                {t("payments.status.completed")}
              </SelectItem>
              <SelectItem value="pending">
                {t("payments.status.pending")}
              </SelectItem>
              <SelectItem value="failed">
                {t("payments.status.failed")}
              </SelectItem>
              <SelectItem value="refunded">
                {t("payments.status.refunded")}
              </SelectItem>
              <SelectItem value="cancelled">
                {t("payments.status.cancelled")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.type}
            onValueChange={(value: any) =>
              setFilters({ ...filters, type: value })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all_types")}</SelectItem>
              <SelectItem value="promotion">
                {t("payments.types.promotion")}
              </SelectItem>
              <SelectItem value="subscription">
                {t("payments.types.subscription")}
              </SelectItem>
              <SelectItem value="featured_listing">
                {t("payments.types.featured_listing")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.dateRange}
            onValueChange={(value: any) =>
              setFilters({ ...filters, dateRange: value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all_time")}</SelectItem>
              <SelectItem value="today">{t("common.today")}</SelectItem>
              <SelectItem value="week">{t("common.this_week")}</SelectItem>
              <SelectItem value="month">{t("common.this_month")}</SelectItem>
              <SelectItem value="quarter">
                {t("common.this_quarter")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">
              {t("payments.total_transactions")}
            </span>
          </div>
          <p className="text-lg font-semibold mt-1">
            {filteredAndSortedPayments.length}
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">
              {t("payments.total_amount")}
            </span>
          </div>
          <p className="text-lg font-semibold mt-1 text-green-600">
            {formatCurrency(totalAmount)}
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">
              {t("payments.completed_amount")}
            </span>
          </div>
          <p className="text-lg font-semibold mt-1 text-green-600">
            {formatCurrency(completedAmount)}
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium">
              {t("payments.success_rate")}
            </span>
          </div>
          <p className="text-lg font-semibold mt-1">
            {filteredAndSortedPayments.length > 0
              ? Math.round(
                  (filteredAndSortedPayments.filter(
                    (p) => p.status === "completed"
                  ).length /
                    filteredAndSortedPayments.length) *
                    100
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPayments.length > 0 && (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm text-blue-800 dark:text-blue-200">
            {t("payments.selected_count", { count: selectedPayments.length })}
          </span>
          <Button variant="outline" size="sm">
            {t("common.bulk_refund")}
          </Button>
          <Button variant="outline" size="sm">
            {t("common.bulk_export")}
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
              <TableHead>{t("payments.table.transaction_id")}</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("user")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("payments.table.user")}</span>
                  {getSortIcon("user")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("type")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("payments.table.type")}</span>
                  {getSortIcon("type")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("payments.table.amount")}</span>
                  {getSortIcon("amount")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("payments.table.status")}</span>
                  {getSortIcon("status")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("payments.table.date")}</span>
                  {getSortIcon("createdAt")}
                </div>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {Object.values(filters).some(
                        (v) => v !== "all" && v !== ""
                      )
                        ? t("payments.no_results")
                        : t("payments.no_payments")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedPayments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedPayments.includes(payment.id)}
                      onCheckedChange={(checked) =>
                        handleSelectPayment(payment.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-mono text-sm">
                        {payment.provider.transactionId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.invoice.number}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={""} alt={payment.user.name} />
                        <AvatarFallback className="text-xs">
                          {payment.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {payment.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(payment.type)}
                      <div>
                        <p className="text-sm font-medium">
                          {t(`payments.types.${payment.type}`)}
                        </p>
                        {payment.metadata.promotionType && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            {getPromotionTypeIcon(
                              payment.metadata.promotionType
                            )}
                            <span>
                              {t(
                                `payments.promotion.${payment.metadata.promotionType}`
                              )}
                            </span>
                          </div>
                        )}
                        {payment.metadata.duration && (
                          <p className="text-xs text-muted-foreground">
                            {payment.metadata.duration} {t("common.days")}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(
                          payment.amount.value,
                          payment.amount.currency
                        )}
                      </p>
                      {payment.refund && (
                        <p className="text-xs text-red-600">
                          -
                          {formatCurrency(
                            payment.refund.amount,
                            payment.amount.currency
                          )}{" "}
                          {t("payments.refunded")}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      <Badge
                        className={cn(
                          "text-xs",
                          getStatusColor(payment.status)
                        )}
                      >
                        {t(`payments.status.${payment.status}`)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatTimeAgo(payment.createdAt)}</span>
                      </div>
                      <p className="text-xs">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
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
                          <DropdownMenuItem onClick={() => onView(payment)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t("common.view_details")}
                          </DropdownMenuItem>
                        )}
                        {onDownloadInvoice && (
                          <DropdownMenuItem
                            onClick={() => onDownloadInvoice(payment)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {t("payments.download_invoice")}
                          </DropdownMenuItem>
                        )}
                        {payment.provider.paymentIntentId && (
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(
                                `https://dashboard.stripe.com/payments/${payment.provider.paymentIntentId}`,
                                "_blank"
                              )
                            }
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {t("payments.view_in_stripe")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {onRetry && payment.status === "failed" && (
                          <DropdownMenuItem onClick={() => onRetry(payment)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t("payments.retry")}
                          </DropdownMenuItem>
                        )}
                        {onRefund &&
                          payment.status === "completed" &&
                          !payment.refund && (
                            <DropdownMenuItem
                              onClick={() => onRefund(payment)}
                              className="text-red-600"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              {t("payments.refund")}
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
          {t("payments.showing_results", {
            start: filteredAndSortedPayments.length > 0 ? 1 : 0,
            end: filteredAndSortedPayments.length,
            total: payments.length,
          })}
        </div>
        {selectedPayments.length > 0 && (
          <div>
            {t("payments.selected_count", { count: selectedPayments.length })} •
            {t("payments.selected_total")}:{" "}
            {formatCurrency(
              filteredAndSortedPayments
                .filter((p) => selectedPayments.includes(p.id))
                .reduce((sum, p) => sum + p.amount.value, 0)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
