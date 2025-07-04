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
  Edit,
  Trash2,
  Eye,
  Ban,
  UserCheck,
  Shield,
  Crown,
  Star,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package,
  Calendar,
  Globe,
  Plus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import type { UserProfile } from "@/lib/types/user";
import type { UserRole, UserStatus } from "@/lib/types/global";

interface UsersTableProps {
  users: UserProfile[];
  isLoading?: boolean;
  onView?: (user: UserProfile) => void;
  onEdit?: (user: UserProfile) => void;
  onDelete?: (user: UserProfile) => void;
  onSuspend?: (user: UserProfile) => void;
  onActivate?: (user: UserProfile) => void;
  onChangeRole?: (user: UserProfile, role: UserRole) => void;
  onCreateNew?: () => void;
  className?: string;
}

type SortField =
  | "name"
  | "email"
  | "role"
  | "status"
  | "createdAt"
  | "lastLoginAt"
  | "listings";
type SortDirection = "asc" | "desc";

interface TableFilters {
  search: string;
  status: UserStatus | "all";
  role: UserRole | "all";
  subscription: "all" | "free" | "basic" | "premium";
  verified: "all" | "verified" | "unverified";
  location: string;
}

export function UsersTable({
  users,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onSuspend,
  onActivate,
  onChangeRole,
  onCreateNew,
  className,
}: UsersTableProps) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filters, setFilters] = useState<TableFilters>({
    search: "",
    status: "all",
    role: "all",
    subscription: "all",
    verified: "all",
    location: "",
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

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "moderator":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "user":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "suspended":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "banned":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3 text-red-600" />;
      case "moderator":
        return <Shield className="h-3 w-3 text-purple-600" />;
      default:
        return <Users className="h-3 w-3 text-blue-600" />;
    }
  };

  const getSubscriptionColor = (plan: string) => {
    switch (plan) {
      case "premium":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "basic":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredAndSortedUsers = users
    .filter((user) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !user.name.toLowerCase().includes(searchLower) &&
          !user.email.toLowerCase().includes(searchLower) &&
          !(user.phone && user.phone.toLowerCase().includes(searchLower))
        ) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== "all" && user.status !== filters.status) {
        return false;
      }

      // Role filter
      if (filters.role !== "all" && user.role !== filters.role) {
        return false;
      }

      // Subscription filter
      if (filters.subscription !== "all") {
        const userPlan = user.subscription?.plan || "free";
        if (userPlan !== filters.subscription) {
          return false;
        }
      }

      // Verified filter
      if (filters.verified !== "all") {
        const isVerified =
          user.verification.email.verified &&
          (!user.phone || user.verification.phone.verified);
        if (filters.verified === "verified" && !isVerified) return false;
        if (filters.verified === "unverified" && isVerified) return false;
      }

      // Location filter
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        if (
          !user.location.city.toLowerCase().includes(locationLower) &&
          !user.location.state.toLowerCase().includes(locationLower) &&
          !user.location.country.toLowerCase().includes(locationLower)
        ) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "role":
          aValue = a.role;
          bValue = b.role;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "lastLoginAt":
          aValue = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          bValue = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          break;
        case "listings":
          aValue = a.stats.totalListings;
          bValue = b.stats.totalListings;
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
      setSelectedUsers(filteredAndSortedUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const isAllSelected =
    selectedUsers.length === filteredAndSortedUsers.length &&
    filteredAndSortedUsers.length > 0;
  const isPartiallySelected =
    selectedUsers.length > 0 &&
    selectedUsers.length < filteredAndSortedUsers.length;

  // Calculate stats
  const activeCount = filteredAndSortedUsers.filter(
    (u) => u.status === "active"
  ).length;
  const verifiedCount = filteredAndSortedUsers.filter(
    (u) => u.verification.email.verified
  ).length;
  const premiumCount = filteredAndSortedUsers.filter(
    (u) => u.subscription?.plan === "premium"
  ).length;

  // Get unique locations for filter
  const locations = Array.from(new Set(users.map((u) => u.location.city)))
    .filter(Boolean)
    .sort();

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
              placeholder={t("users.search_placeholder")}
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
              <SelectItem value="active">{t("users.status.active")}</SelectItem>
              <SelectItem value="suspended">
                {t("users.status.suspended")}
              </SelectItem>
              <SelectItem value="banned">{t("users.status.banned")}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.role}
            onValueChange={(value: any) =>
              setFilters({ ...filters, role: value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all_roles")}</SelectItem>
              <SelectItem value="user">{t("users.roles.user")}</SelectItem>
              <SelectItem value="moderator">
                {t("users.roles.moderator")}
              </SelectItem>
              <SelectItem value="admin">{t("users.roles.admin")}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.subscription}
            onValueChange={(value: any) =>
              setFilters({ ...filters, subscription: value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all_plans")}</SelectItem>
              <SelectItem value="free">{t("users.plans.free")}</SelectItem>
              <SelectItem value="basic">{t("users.plans.basic")}</SelectItem>
              <SelectItem value="premium">
                {t("users.plans.premium")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            {t("users.create_new")}
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">
              {t("users.total_users")}
            </span>
          </div>
          <p className="text-lg font-semibold mt-1">
            {filteredAndSortedUsers.length}
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">
              {t("users.active_users")}
            </span>
          </div>
          <p className="text-lg font-semibold mt-1 text-green-600">
            {activeCount}
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">
              {t("users.verified_users")}
            </span>
          </div>
          <p className="text-lg font-semibold mt-1">{verifiedCount}</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Crown className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">
              {t("users.premium_users")}
            </span>
          </div>
          <p className="text-lg font-semibold mt-1 text-purple-600">
            {premiumCount}
          </p>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm text-blue-800 dark:text-blue-200">
            {t("users.selected_count", { count: selectedUsers.length })}
          </span>
          <Button variant="outline" size="sm">
            {t("common.bulk_activate")}
          </Button>
          <Button variant="outline" size="sm">
            {t("common.bulk_suspend")}
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
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("users.table.user")}</span>
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("users.table.contact")}</span>
                  {getSortIcon("email")}
                </div>
              </TableHead>
              <TableHead>{t("users.table.location")}</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("role")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("users.table.role")}</span>
                  {getSortIcon("role")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("users.table.status")}</span>
                  {getSortIcon("status")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("listings")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("users.table.listings")}</span>
                  {getSortIcon("listings")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center space-x-2">
                  <span>{t("users.table.joined")}</span>
                  {getSortIcon("createdAt")}
                </div>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <Users className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {Object.values(filters).some(
                        (v) => v !== "all" && v !== ""
                      )
                        ? t("users.no_results")
                        : t("users.no_users")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) =>
                        handleSelectUser(user.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{user.name}</p>
                          {getRoleIcon(user.role)}
                          {user.subscription &&
                            user.subscription.plan !== "free" && (
                              <Crown className="h-3 w-3 text-purple-600" />
                            )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          {user.stats.rating > 0 && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span>{user.stats.rating.toFixed(1)}</span>
                            </div>
                          )}
                          {user.lastLoginAt && (
                            <span>
                              {t("users.last_login")}:{" "}
                              {formatTimeAgo(user.lastLoginAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3 w-3 text-blue-600" />
                        <span className="text-sm">{user.email}</span>
                        {user.verification.email.verified ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-600" />
                        )}
                      </div>
                      {user.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3 text-green-600" />
                          <span className="text-sm">{user.phone}</span>
                          {user.verification.phone.verified ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-3 w-3 text-gray-600" />
                      <div className="text-sm">
                        <p>{user.location.city}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.location.state}, {user.location.country}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-xs", getRoleColor(user.role))}>
                      {t(`users.roles.${user.role}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={cn("text-xs", getStatusColor(user.status))}
                      >
                        {t(`users.status.${user.status}`)}
                      </Badge>
                      {user.subscription &&
                        user.subscription.plan !== "free" && (
                          <Badge
                            className={cn(
                              "text-xs",
                              getSubscriptionColor(user.subscription.plan)
                            )}
                          >
                            {t(`users.plans.${user.subscription.plan}`)}
                          </Badge>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <div className="text-sm">
                        <p className="font-medium">
                          {user.stats.totalListings}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.stats.activeListings} {t("users.active")}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatTimeAgo(user.createdAt)}</span>
                      </div>
                      <p className="text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
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
                          <DropdownMenuItem onClick={() => onView(user)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t("common.view")}
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {onChangeRole && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onChangeRole(user, "user")}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              {t("users.make_user")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onChangeRole(user, "moderator")}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              {t("users.make_moderator")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onChangeRole(user, "admin")}
                            >
                              <Crown className="h-4 w-4 mr-2" />
                              {t("users.make_admin")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {onActivate && user.status !== "active" && (
                          <DropdownMenuItem onClick={() => onActivate(user)}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            {t("users.activate")}
                          </DropdownMenuItem>
                        )}
                        {onSuspend && user.status === "active" && (
                          <DropdownMenuItem onClick={() => onSuspend(user)}>
                            <Ban className="h-4 w-4 mr-2" />
                            {t("users.suspend")}
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(user)}
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
          {t("users.showing_results", {
            start: filteredAndSortedUsers.length > 0 ? 1 : 0,
            end: filteredAndSortedUsers.length,
            total: users.length,
          })}
        </div>
        {selectedUsers.length > 0 && (
          <div>
            {t("users.selected_count", { count: selectedUsers.length })}
          </div>
        )}
      </div>
    </div>
  );
}
