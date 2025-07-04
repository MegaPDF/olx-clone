"use client";

import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Crown,
  Calendar,
  Upload,
  X,
  Star,
  Package,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { UserProfile } from "@/lib/types/user";
import type {
  UserRole,
  UserStatus,
  Currency,
  Locale,
  Theme,
} from "@/lib/types/global";

interface UserFormProps {
  user?: UserProfile;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
  mode?: "create" | "edit";
}

interface UserFormData {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  preferences: {
    language: Locale;
    currency: Currency;
    theme: Theme;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  role: UserRole;
  status: UserStatus;
  verification: {
    email: boolean;
    phone: boolean;
  };
  subscription?: {
    plan: "free" | "basic" | "premium";
  };
}

const createUserSchema = (t: any, mode: "create" | "edit" = "create") =>
  z.object({
    name: z.string().min(1, t("validation.required")),
    email: z.string().email(t("validation.valid_email")),
    phone: z.string().optional(),
    avatar: z.string().optional(),
    location: z.object({
      address: z.string().min(1, t("validation.required")),
      city: z.string().min(1, t("validation.required")),
      state: z.string().min(1, t("validation.required")),
      country: z.string().min(1, t("validation.required")),
    }),
    preferences: z.object({
      language: z.enum(["en", "id"]),
      currency: z.enum(["USD", "IDR"]),
      theme: z.enum(["light", "dark", "system"]),
      notifications: z.object({
        email: z.boolean(),
        push: z.boolean(),
        sms: z.boolean(),
      }),
    }),
    role: z.enum(["user", "admin", "moderator"]),
    status: z.enum(["active", "suspended", "banned"]),
    verification: z.object({
      email: z.boolean(),
      phone: z.boolean(),
    }),
    subscription: z
      .object({
        plan: z.enum(["free", "basic", "premium"]),
      })
      .optional(),
  });

export function UserForm({
  user,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
  mode = user ? "edit" : "create",
}: UserFormProps) {
  const t = useTranslations("listings"); // CHANGED
  const locale = useLocale(); // CHANGED
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    user?.avatar
  );

  const schema = createUserSchema(t, mode);

  const form = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      avatar: user?.avatar || "",
      location: {
        address: user?.location.address || "",
        city: user?.location.city || "",
        state: user?.location.state || "",
        country: user?.location.country || "",
      },
      preferences: {
        language: user?.preferences.language || "en",
        currency: user?.preferences.currency || "USD",
        theme: user?.preferences.theme || "system",
        notifications: {
          email: user?.preferences.notifications.email ?? true,
          push: user?.preferences.notifications.push ?? true,
          sms: user?.preferences.notifications.sms ?? false,
        },
      },
      role: user?.role || "user",
      status: user?.status || "active",
      verification: {
        email: user?.verification.email.verified ?? false,
        phone: user?.verification.phone.verified ?? false,
      },
      subscription: {
        plan: user?.subscription?.plan || "free",
      },
    },
  });

  const handleAvatarUpload = async (file: File) => {
    // This would typically upload to your storage service
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    form.setValue("avatar", url);
  };

  const handleSubmit = async (data: UserFormData) => {
    await onSubmit(data);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "moderator":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "suspended":
        return "text-yellow-600";
      case "banned":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("space-y-6", className)}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>{t("users.form.basic_info")}</span>
                </CardTitle>
                <CardDescription>
                  {t("users.form.basic_info_description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("users.form.full_name")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("users.form.name_placeholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("users.form.email")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder={t("users.form.email_placeholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("users.form.phone")} ({t("common.optional")})
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("users.form.phone_placeholder")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <span>{t("users.form.location")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="location.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("users.form.address")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("users.form.address_placeholder")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="location.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("users.form.city")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("users.form.city_placeholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("users.form.state")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("users.form.state_placeholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("users.form.country")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("users.form.country_placeholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>{t("users.form.preferences")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="preferences.language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("users.form.language")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">
                              {t("language.english")}
                            </SelectItem>
                            <SelectItem value="id">
                              {t("language.indonesian")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferences.currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("users.form.currency")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">
                              {t("currency.usd")}
                            </SelectItem>
                            <SelectItem value="IDR">
                              {t("currency.idr")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferences.theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("users.form.theme")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">
                              {t("theme.light")}
                            </SelectItem>
                            <SelectItem value="dark">
                              {t("theme.dark")}
                            </SelectItem>
                            <SelectItem value="system">
                              {t("theme.system")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">
                    {t("users.form.notifications")}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="preferences.notifications.email"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>{t("users.form.email_notifications")}</span>
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferences.notifications.push"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              {t("users.form.push_notifications")}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferences.notifications.sms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{t("users.form.sms_notifications")}</span>
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Avatar */}
            <Card>
              <CardHeader>
                <CardTitle>{t("users.form.avatar")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview} alt={form.watch("name")} />
                    <AvatarFallback className="text-lg">
                      {form
                        .watch("name")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex space-x-2">
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      {t("common.upload")}
                    </Button>
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAvatarPreview(undefined);
                          form.setValue("avatar", "");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role & Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span>{t("users.form.role_status")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("users.form.role")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>{t("users.roles.user")}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="moderator">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4" />
                              <span>{t("users.roles.moderator")}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center space-x-2">
                              <Crown className="h-4 w-4" />
                              <span>{t("users.roles.admin")}</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("users.form.status")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              {t("users.status.active")}
                            </Badge>
                          </SelectItem>
                          <SelectItem value="suspended">
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800"
                            >
                              {t("users.status.suspended")}
                            </Badge>
                          </SelectItem>
                          <SelectItem value="banned">
                            <Badge variant="destructive">
                              {t("users.status.banned")}
                            </Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Verification */}
            <Card>
              <CardHeader>
                <CardTitle>{t("users.form.verification")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="verification.email"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{t("users.form.email_verified")}</span>
                        </FormLabel>
                        <FormDescription>
                          {t("users.form.email_verified_description")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="verification.phone"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{t("users.form.phone_verified")}</span>
                        </FormLabel>
                        <FormDescription>
                          {t("users.form.phone_verified_description")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Subscription */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  <span>{t("users.form.subscription")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="subscription.plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("users.form.subscription_plan")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="free">
                            <div className="flex items-center space-x-2">
                              <span>{t("users.plans.free")}</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="basic">
                            <div className="flex items-center space-x-2">
                              <span>{t("users.plans.basic")}</span>
                              <Badge variant="secondary">
                                {t("common.popular")}
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="premium">
                            <div className="flex items-center space-x-2">
                              <Crown className="h-4 w-4 text-purple-600" />
                              <span>{t("users.plans.premium")}</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* User Stats (if editing) */}
            {mode === "edit" && user && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("users.form.stats")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">
                        {t("users.stats.total_listings")}
                      </span>
                    </div>
                    <span className="font-medium">
                      {user.stats.totalListings}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">{t("users.stats.rating")}</span>
                    </div>
                    <span className="font-medium">
                      {user.stats.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        {t("users.stats.reviews")}
                      </span>
                    </div>
                    <span className="font-medium">
                      {user.stats.reviewCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">
                        {t("users.stats.member_since")}
                      </span>
                    </div>
                    <span className="font-medium text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <Separator />
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            )}
            {mode === "create" ? t("common.create") : t("common.update")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
