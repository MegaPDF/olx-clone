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
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Crown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Package,
  Eye,
  MessageSquare,
  MoreVertical,
  ExternalLink,
  Edit,
  Ban,
  UserCheck,
  Trash2,
  Globe,
  Smartphone,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import type { UserProfile } from "@/lib/types/user";
import type { UserRole, UserStatus } from "@/lib/types/global";

interface UserDetailsModalProps {
  user?: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (user: UserProfile) => void;
  onDelete?: (user: UserProfile) => void;
  onSuspend?: (user: UserProfile) => void;
  onActivate?: (user: UserProfile) => void;
  onVerifyEmail?: (user: UserProfile) => void;
  onVerifyPhone?: (user: UserProfile) => void;
  className?: string;
}

export function UserDetailsModal({
  user,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onSuspend,
  onActivate,
  onVerifyEmail,
  onVerifyPhone,
  className,
}: UserDetailsModalProps) {
  const { t, i18n } = useTranslation(["admin", "common"]);

  if (!user) return null;

  const formatTimeAgo = (date: Date) => {
    const locale = i18n.language === "id" ? idLocale : enUS;
    return formatDistanceToNow(date, { addSuffix: true, locale });
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
        return <Crown className="h-4 w-4 text-red-600" />;
      case "moderator":
        return <Shield className="h-4 w-4 text-purple-600" />;
      default:
        return <User className="h-4 w-4 text-blue-600" />;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-4xl max-h-[90vh]", className)}>
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl font-semibold flex items-center space-x-2">
                  <span>{user.name}</span>
                  {getRoleIcon(user.role)}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {t("users.member_since")}{" "}
                  {new Date(user.createdAt).toLocaleDateString()} •{" "}
                  {t("users.id")}: {user.id}
                </DialogDescription>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={cn("text-xs", getStatusColor(user.status))}>
                    {t(`users.status.${user.status}`)}
                  </Badge>
                  <Badge className={cn("text-xs", getRoleColor(user.role))}>
                    {t(`users.roles.${user.role}`)}
                  </Badge>
                  {user.subscription && user.subscription.plan !== "free" && (
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
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => window.open(`/users/${user.id}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("common.view_profile")}
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(user)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t("common.edit")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {!user.verification.email.verified && onVerifyEmail && (
                  <DropdownMenuItem onClick={() => onVerifyEmail(user)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t("users.verify_email")}
                  </DropdownMenuItem>
                )}
                {!user.verification.phone.verified &&
                  onVerifyPhone &&
                  user.phone && (
                    <DropdownMenuItem onClick={() => onVerifyPhone(user)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t("users.verify_phone")}
                    </DropdownMenuItem>
                  )}
                <DropdownMenuSeparator />
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
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">
                    {t("users.contact_information")}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("users.email_address")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.verification.email.verified ? (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-800"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {t("users.verified")}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            {t("users.unverified")}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {user.phone && (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="font-medium">{user.phone}</p>
                            <p className="text-xs text-muted-foreground">
                              {t("users.phone_number")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {user.verification.phone.verified ? (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-800"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {t("users.verified")}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              {t("users.unverified")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{t("users.location")}</span>
                  </h3>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{user.location.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.location.city}, {user.location.state}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.location.country}
                    </p>
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">
                    {t("users.preferences")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          {t("users.language_currency")}
                        </span>
                      </div>
                      <p className="text-sm">
                        {t(
                          `language.${
                            user.preferences.language === "en"
                              ? "english"
                              : "indonesian"
                          }`
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.preferences.currency}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Smartphone className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">
                          {t("users.theme")}
                        </span>
                      </div>
                      <p className="text-sm capitalize">
                        {user.preferences.theme}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Bell className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">
                        {t("users.notifications")}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1",
                            user.preferences.notifications.email
                              ? "bg-green-100"
                              : "bg-gray-100"
                          )}
                        >
                          <Mail
                            className={cn(
                              "h-4 w-4",
                              user.preferences.notifications.email
                                ? "text-green-600"
                                : "text-gray-400"
                            )}
                          />
                        </div>
                        <p className="text-xs">{t("users.email")}</p>
                      </div>
                      <div className="text-center">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1",
                            user.preferences.notifications.push
                              ? "bg-green-100"
                              : "bg-gray-100"
                          )}
                        >
                          <Bell
                            className={cn(
                              "h-4 w-4",
                              user.preferences.notifications.push
                                ? "text-green-600"
                                : "text-gray-400"
                            )}
                          />
                        </div>
                        <p className="text-xs">{t("users.push")}</p>
                      </div>
                      <div className="text-center">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1",
                            user.preferences.notifications.sms
                              ? "bg-green-100"
                              : "bg-gray-100"
                          )}
                        >
                          <Phone
                            className={cn(
                              "h-4 w-4",
                              user.preferences.notifications.sms
                                ? "text-green-600"
                                : "text-gray-400"
                            )}
                          />
                        </div>
                        <p className="text-xs">{t("users.sms")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Statistics */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">
                    {t("users.statistics")}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Package className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                      <p className="text-lg font-semibold">
                        {user.stats.totalListings}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("users.total_listings")}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <CheckCircle className="h-4 w-4 mx-auto mb-1 text-green-600" />
                      <p className="text-lg font-semibold">
                        {user.stats.activeListings}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("users.active_listings")}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Eye className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                      <p className="text-lg font-semibold">
                        {user.stats.totalViews.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("users.total_views")}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <Star className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
                      <p className="text-lg font-semibold">
                        {user.stats.rating.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("users.rating")}
                      </p>
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <MessageSquare className="h-4 w-4 mx-auto mb-1 text-green-600" />
                    <p className="text-lg font-semibold">
                      {user.stats.reviewCount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("users.reviews")}
                    </p>
                  </div>
                </div>

                {/* Subscription Details */}
                {user.subscription && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center space-x-2">
                      <Crown className="h-4 w-4 text-purple-600" />
                      <span>{t("users.subscription")}</span>
                    </h3>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t("users.plan")}</span>
                        <Badge
                          className={cn(
                            "text-xs",
                            getSubscriptionColor(user.subscription.plan)
                          )}
                        >
                          {t(`users.plans.${user.subscription.plan}`)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t("users.status")}</span>
                        <Badge
                          variant={
                            user.subscription.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {t(
                            `users.subscription_status.${user.subscription.status}`
                          )}
                        </Badge>
                      </div>
                      {user.subscription.expiresAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{t("users.expires")}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(
                              user.subscription.expiresAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Account Status */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">
                    {t("users.account_status")}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{t("users.status")}</span>
                      <Badge
                        className={cn("text-xs", getStatusColor(user.status))}
                      >
                        {t(`users.status.${user.status}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{t("users.role")}</span>
                      <Badge className={cn("text-xs", getRoleColor(user.role))}>
                        {t(`users.roles.${user.role}`)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Account Dates */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{t("users.dates")}</span>
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("users.joined")}
                      </span>
                      <span>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("users.updated")}
                      </span>
                      <span>
                        {new Date(user.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {user.lastLoginAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t("users.last_login")}
                        </span>
                        <span>{formatTimeAgo(user.lastLoginAt)}</span>
                      </div>
                    )}
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
