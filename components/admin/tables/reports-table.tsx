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
  CheckSquare,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  Package,
  MessageSquare,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Clock,
  ExternalLink,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import type { ReportDetail } from "@/lib/types/admin";
import type { ReportStatus } from "@/lib/types/global";

interface ReportsTableProps {
  reports: ReportDetail[];
  isLoading?: boolean;
  onView?: (report: ReportDetail) => void;
  onResolve?: (report: ReportDetail) => void;
  onDismiss?: (report: ReportDetail) => void;
  onAssign?: (report: ReportDetail) => void;
  className?: string;
}

type SortField = "createdAt" | "priority" | "status" | "category" | "reporter";
type SortDirection = "asc" | "desc";

interface TableFilters {
  search: string;
  status: ReportStatus | "all";
  category: "all" | "spam" | "inappropriate" | "fraud" | "duplicate" | "other";
  priority: "all" | "low" | "medium" | "high" | "urgent";
  targetType: "all" | "listing" | "user" | "message";
  assigned: "all" | "assigned" | "unassigned";
}

export function ReportsTable({
  reports,
  isLoading = false,
  onView,
  onResolve,
  onDismiss,
  onAssign,
  className,
}: ReportsTableProps) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filters, setFilters] = useState<TableFilters>({
    search: "",
    status: "all",
    category: "all",
    priority: "all",
    targetType: "all",
    assigned: "all",
  });

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

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "investigating":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "dismissed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case "investigating":
        return <Eye className="h-3 w-3 text-blue-600" />;
      case "resolved":
        return <CheckSquare className="h-3 w-3 text-green-600" />;
      case "dismissed":
        return <XCircle className="h-3 w-3 text-gray-600" />;
      default:
        return <FileText className="h-3 w-3 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
      case "high":
        return <Flag className="h-3 w-3 text-orange-600" />;
      case "medium":
        return <Flag className="h-3 w-3 text-yellow-600" />;
      case "low":
        return <Flag className="h-3 w-3 text-blue-600" />;
      default:
        return <Flag className="h-3 w-3 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "spam":
        return "bg-red-100 text-red-800";
      case "inappropriate":
        return "bg-orange-100 text-orange-800";
      case "fraud":
        return "bg-purple-100 text-purple-800";
      case "duplicate":
        return "bg-blue-100 text-blue-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case "listing":
        return <Package className="h-4 w-4 text-green-600" />;
      case "user":
        return <User className="h-4 w-4 text-blue-600" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredAndSortedReports = reports
    .filter((report) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !report.reporter.name.toLowerCase().includes(searchLower) &&
          !report.reporter.email.toLowerCase().includes(searchLower) &&
          !report.reason.toLowerCase().includes(searchLower) &&
          !(
            report.target.title &&
            report.target.title.toLowerCase().includes(searchLower)
          )
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== "all" && report.status !== filters.status) {
        return false;
      }

      // Category filter
      if (filters.category !== "all" && report.category !== filters.category) {
        return false;
      }

      // Priority filter
      if (filters.priority !== "all" && report.priority !== filters.priority) {
        return false;
      }

      // Target type filter
      if (
        filters.targetType !== "all" &&
        report.target.type !== filters.targetType
      ) {
        return false;
      }

      // Assigned filter
      if (filters.assigned !== "all") {
        if (filters.assigned === "assigned" && !report.moderator) return false;
        if (filters.assigned === "unassigned" && report.moderator) return false;
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
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "category":
          aValue = a.category;
          bValue = b.category;
          break;
        case "reporter":
          aValue = a.reporter.name.toLowerCase();
          bValue = b.reporter.name.toLowerCase();
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
      setSelectedReports(filteredAndSortedReports.map((r) => r.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectReport = (reportId: string, checked: boolean) => {
    if (checked) {
      setSelectedReports([...selectedReports, reportId]);
    } else {
      setSelectedReports(selectedReports.filter((id) => id !== reportId));
    }
  };

  const isAllSelected =
    selectedReports.length === filteredAndSortedReports.length &&
    filteredAndSortedReports.length > 0;
  const isPartiallySelected =
    selectedReports.length > 0 &&
    selectedReports.length < filteredAndSortedReports.length;

  // Calculate stats
  const pendingCount = filteredAndSortedReports.filter(
    (r) => r.status === "pending"
  ).length;
  const urgentCount = filteredAndSortedReports.filter(
    (r) => r.priority === "urgent"
  ).length;
  const unassignedCount = filteredAndSortedReports.filter(
    (r) => !r.moderator
  ).length;

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
              placeholder={t("reports.search_placeholder")}
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
              <SelectItem value="pending">
                {t("reports.status.pending")}
              </SelectItem>
              <SelectItem value="investigating">
                {t("reports.status.investigating")}
              </SelectItem>
              <SelectItem value="resolved">
                {t("reports.status.resolved")}
              </SelectItem>
              <SelectItem value="dismissed">
                {t("reports.status.dismissed")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.priority}
            onValueChange={(value: any) =>
              setFilters({ ...filters, priority: value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all_priorities")}</SelectItem>
              <SelectItem value="urgent">
                {t("reports.priority.urgent")}
              </SelectItem>
              <SelectItem value="high">{t("reports.priority.high")}</SelectItem>
              <SelectItem value="medium">
                {t("reports.priority.medium")}
              </SelectItem>
              <SelectItem value="low">{t("reports.priority.low")}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.category}
            onValueChange={(value: any) =>
              setFilters({ ...filters, category: value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all_categories")}</SelectItem>
              <SelectItem value="spam">
                {t("reports.categories.spam")}
              </SelectItem>
              <SelectItem value="inappropriate">
                {t("reports.categories.inappropriate")}
              </SelectItem>
              <SelectItem value="fraud">
                {t("reports.categories.fraud")}
              </SelectItem>
              <SelectItem value="duplicate">
                {t("reports.categories.duplicate")}
              </SelectItem>
              <SelectItem value="other">
                {t("reports.categories.other")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">
              {t("reports.total_reports")}
            </span>
          </div>
          <p className="text-lg font-semibold mt-1">
            {filteredAndSortedReports.length}
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium">{t("reports.pending")}</span>
          </div>
          <p className="text-lg font-semibold mt-1 text-yellow-600">
            {pendingCount}
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium">{t("reports.urgent")}</span>
          </div>
          <p className="text-lg font-semibold mt-1 text-red-600">
            {urgentCount}
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">
              {t("reports.unassigned")}
            </span>
          </div>
          <p className="text-lg font-semibold mt-1">{unassignedCount}</p>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedReports.length > 0 && (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm text-blue-800 dark:text-blue-200">
            {t("reports.selected_count", { count: selectedReports.length })}
          </span>
          <Button variant="outline" size="sm">
            {t("common.bulk_assign")}
          </Button>
          <Button variant="outline" size="sm">
            {t("common.bulk_resolve")}
          </Button>
          <Button variant="outline" size="sm">
            {t("common.bulk_dismiss")}
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
              <TableHead>{t("reports.table.target")}</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("reporter")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("reports.table.reporter")}</span>
                  {getSortIcon("reporter")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("reports.table.category")}</span>
                  {getSortIcon("category")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("priority")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("reports.table.priority")}</span>
                  {getSortIcon("priority")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("reports.table.status")}</span>
                  {getSortIcon("status")}
                </div>
              </TableHead>
              <TableHead>{t("reports.table.assigned")}</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("reports.table.created")}</span>
                  {getSortIcon("createdAt")}
                </div>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {Object.values(filters).some(
                        (v) => v !== "all" && v !== ""
                      )
                        ? t("reports.no_results")
                        : t("reports.no_reports")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedReports.map((report) => (
                <TableRow key={report.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedReports.includes(report.id)}
                      onCheckedChange={(checked) =>
                        handleSelectReport(report.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {getTargetIcon(report.target.type)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">
                            {report.target.title ||
                              t(`reports.target_types.${report.target.type}`)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {t(`reports.target_types.${report.target.type}`)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {report.reason}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={""} alt={report.reporter.name} />
                        <AvatarFallback className="text-xs">
                          {report.reporter.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {report.reporter.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {report.reporter.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        getCategoryColor(report.category)
                      )}
                    >
                      {t(`reports.categories.${report.category}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(report.priority)}
                      <Badge
                        className={cn(
                          "text-xs",
                          getPriorityColor(report.priority)
                        )}
                      >
                        {t(`reports.priority.${report.priority}`)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(report.status)}
                      <Badge
                        className={cn("text-xs", getStatusColor(report.status))}
                      >
                        {t(`reports.status.${report.status}`)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {report.moderator ? (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={""} alt={report.moderator.name} />
                          <AvatarFallback className="text-xs">
                            {report.moderator.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{report.moderator.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {t("reports.unassigned")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatTimeAgo(report.createdAt)}</span>
                      </div>
                      <p className="text-xs">
                        {new Date(report.createdAt).toLocaleDateString()}
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
                          <DropdownMenuItem onClick={() => onView(report)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t("common.view_details")}
                          </DropdownMenuItem>
                        )}
                        {report.target.url && (
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(report.target.url, "_blank")
                            }
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {t("reports.view_target")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {onAssign && !report.moderator && (
                          <DropdownMenuItem onClick={() => onAssign(report)}>
                            <User className="h-4 w-4 mr-2" />
                            {t("reports.assign_to_me")}
                          </DropdownMenuItem>
                        )}
                        {onResolve && report.status !== "resolved" && (
                          <DropdownMenuItem onClick={() => onResolve(report)}>
                            <CheckSquare className="h-4 w-4 mr-2" />
                            {t("reports.resolve")}
                          </DropdownMenuItem>
                        )}
                        {onDismiss && report.status !== "dismissed" && (
                          <DropdownMenuItem onClick={() => onDismiss(report)}>
                            <XCircle className="h-4 w-4 mr-2" />
                            {t("reports.dismiss")}
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
          {t("reports.showing_results", {
            start: filteredAndSortedReports.length > 0 ? 1 : 0,
            end: filteredAndSortedReports.length,
            total: reports.length,
          })}
        </div>
        {selectedReports.length > 0 && (
          <div>
            {t("reports.selected_count", { count: selectedReports.length })}
          </div>
        )}
      </div>
    </div>
  );
}
