"use client";

import { useTranslation } from "next-i18next";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Star,
  Zap,
  Eye,
  TrendingUp,
  Crown,
  Users,
  Package,
  Camera,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Currency } from "@/lib/types/global";

interface PricingFormProps {
  pricing?: PricingConfig;
  onSubmit: (data: PricingConfig) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

interface PricingConfig {
  currency: Currency;
  promotion: {
    featured: { price: number; duration: number; enabled: boolean };
    urgent: { price: number; duration: number; enabled: boolean };
    highlight: { price: number; duration: number; enabled: boolean };
  };
  subscription: {
    basic: {
      monthly: number;
      yearly: number;
      enabled: boolean;
      features: {
        maxListings: number;
        maxImages: number;
        promotedListings: number;
        priority: boolean;
        analytics: boolean;
      };
    };
    premium: {
      monthly: number;
      yearly: number;
      enabled: boolean;
      features: {
        maxListings: number;
        maxImages: number;
        promotedListings: number;
        priority: boolean;
        analytics: boolean;
        verification: boolean;
        support: boolean;
      };
    };
  };
  freeUser: {
    maxListings: number;
    maxImages: number;
    listingDuration: number;
  };
  commissions: {
    enableCommissions: boolean;
    commissionRate: number;
    minimumCommission: number;
  };
}

const createPricingSchema = (t: any) =>
  z.object({
    currency: z.enum(["USD", "IDR"]),
    promotion: z.object({
      featured: z.object({
        price: z.number().min(0, t("validation.min_value")),
        duration: z.number().min(1, t("validation.min_duration")),
        enabled: z.boolean(),
      }),
      urgent: z.object({
        price: z.number().min(0, t("validation.min_value")),
        duration: z.number().min(1, t("validation.min_duration")),
        enabled: z.boolean(),
      }),
      highlight: z.object({
        price: z.number().min(0, t("validation.min_value")),
        duration: z.number().min(1, t("validation.min_duration")),
        enabled: z.boolean(),
      }),
    }),
    subscription: z.object({
      basic: z.object({
        monthly: z.number().min(0, t("validation.min_value")),
        yearly: z.number().min(0, t("validation.min_value")),
        enabled: z.boolean(),
        features: z.object({
          maxListings: z.number().min(1, t("validation.min_listings")),
          maxImages: z.number().min(1, t("validation.min_images")),
          promotedListings: z.number().min(0, t("validation.min_value")),
          priority: z.boolean(),
          analytics: z.boolean(),
        }),
      }),
      premium: z.object({
        monthly: z.number().min(0, t("validation.min_value")),
        yearly: z.number().min(0, t("validation.min_value")),
        enabled: z.boolean(),
        features: z.object({
          maxListings: z.number().min(1, t("validation.min_listings")),
          maxImages: z.number().min(1, t("validation.min_images")),
          promotedListings: z.number().min(0, t("validation.min_value")),
          priority: z.boolean(),
          analytics: z.boolean(),
          verification: z.boolean(),
          support: z.boolean(),
        }),
      }),
    }),
    freeUser: z.object({
      maxListings: z.number().min(1, t("validation.min_listings")),
      maxImages: z.number().min(1, t("validation.min_images")),
      listingDuration: z.number().min(1, t("validation.min_duration")),
    }),
    commissions: z.object({
      enableCommissions: z.boolean(),
      commissionRate: z
        .number()
        .min(0)
        .max(100, t("validation.max_percentage")),
      minimumCommission: z.number().min(0, t("validation.min_value")),
    }),
  });

export function PricingForm({
  pricing,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
}: PricingFormProps) {
  const { t } = useTranslation(["admin", "common"]);

  const schema = createPricingSchema(t);

  const form = useForm<PricingConfig>({
    resolver: zodResolver(schema),
    defaultValues: pricing || {
      currency: "USD",
      promotion: {
        featured: { price: 5, duration: 7, enabled: true },
        urgent: { price: 3, duration: 3, enabled: true },
        highlight: { price: 2, duration: 5, enabled: true },
      },
      subscription: {
        basic: {
          monthly: 9.99,
          yearly: 99.99,
          enabled: true,
          features: {
            maxListings: 50,
            maxImages: 10,
            promotedListings: 5,
            priority: false,
            analytics: true,
          },
        },
        premium: {
          monthly: 19.99,
          yearly: 199.99,
          enabled: true,
          features: {
            maxListings: 200,
            maxImages: 20,
            promotedListings: 20,
            priority: true,
            analytics: true,
            verification: true,
            support: true,
          },
        },
      },
      freeUser: {
        maxListings: 5,
        maxImages: 5,
        listingDuration: 30,
      },
      commissions: {
        enableCommissions: false,
        commissionRate: 5,
        minimumCommission: 1,
      },
    },
  });

  const formatCurrency = (amount: number, currency: Currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateYearlyDiscount = (monthly: number, yearly: number) => {
    const monthlyTotal = monthly * 12;
    const savings = monthlyTotal - yearly;
    return Math.round((savings / monthlyTotal) * 100);
  };

  const handleSubmit = async (data: PricingConfig) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("space-y-6", className)}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>{t("pricing.general_settings")}</span>
                </CardTitle>
                <CardDescription>
                  {t("pricing.general_description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("pricing.currency")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="IDR">IDR (Rp)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Promotion Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span>{t("pricing.promotion_pricing")}</span>
                </CardTitle>
                <CardDescription>
                  {t("pricing.promotion_description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Featured Listing */}
                <div className="grid grid-cols-12 gap-4 items-center p-4 border rounded-lg">
                  <div className="col-span-1">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="col-span-3">
                    <h4 className="font-medium">
                      {t("pricing.promotion.featured")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("pricing.promotion.featured_description")}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name="promotion.featured.price"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min="0"
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name="promotion.featured.duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1"
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="promotion.featured.enabled"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Urgent Listing */}
                <div className="grid grid-cols-12 gap-4 items-center p-4 border rounded-lg">
                  <div className="col-span-1">
                    <Zap className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="col-span-3">
                    <h4 className="font-medium">
                      {t("pricing.promotion.urgent")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("pricing.promotion.urgent_description")}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name="promotion.urgent.price"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min="0"
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name="promotion.urgent.duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1"
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="promotion.urgent.enabled"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Highlight Listing */}
                <div className="grid grid-cols-12 gap-4 items-center p-4 border rounded-lg">
                  <div className="col-span-1">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="col-span-3">
                    <h4 className="font-medium">
                      {t("pricing.promotion.highlight")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("pricing.promotion.highlight_description")}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name="promotion.highlight.price"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min="0"
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name="promotion.highlight.duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1"
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="promotion.highlight.enabled"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Plans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  <span>{t("pricing.subscription_plans")}</span>
                </CardTitle>
                <CardDescription>
                  {t("pricing.subscription_description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Plan */}
                <Card className="border-blue-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {t("pricing.plans.basic")}
                      </CardTitle>
                      <FormField
                        control={form.control}
                        name="subscription.basic.enabled"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="subscription.basic.monthly"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("pricing.monthly_price")}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="0.01"
                                min="0"
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subscription.basic.yearly"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("pricing.yearly_price")}
                              <Badge variant="secondary" className="ml-2">
                                {calculateYearlyDiscount(
                                  form.watch("subscription.basic.monthly"),
                                  field.value
                                )}
                                % {t("common.off")}
                              </Badge>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="0.01"
                                min="0"
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="subscription.basic.features.maxListings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-1">
                              <Package className="h-4 w-4" />
                              <span>{t("pricing.max_listings")}</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="1"
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subscription.basic.features.maxImages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-1">
                              <Camera className="h-4 w-4" />
                              <span>{t("pricing.max_images")}</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="1"
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subscription.basic.features.promotedListings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-1">
                              <Megaphone className="h-4 w-4" />
                              <span>{t("pricing.promoted_listings")}</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex space-x-4">
                      <FormField
                        control={form.control}
                        name="subscription.basic.features.priority"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>
                              {t("pricing.features.priority_support")}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subscription.basic.features.analytics"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>
                              {t("pricing.features.analytics")}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Premium Plan */}
                <Card className="border-purple-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{t("pricing.plans.premium")}</span>
                        <Badge variant="secondary">{t("common.popular")}</Badge>
                      </CardTitle>
                      <FormField
                        control={form.control}
                        name="subscription.premium.enabled"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="subscription.premium.monthly"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("pricing.monthly_price")}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="0.01"
                                min="0"
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subscription.premium.yearly"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("pricing.yearly_price")}
                              <Badge variant="secondary" className="ml-2">
                                {calculateYearlyDiscount(
                                  form.watch("subscription.premium.monthly"),
                                  field.value
                                )}
                                % {t("common.off")}
                              </Badge>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="0.01"
                                min="0"
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="subscription.premium.features.maxListings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-1">
                              <Package className="h-4 w-4" />
                              <span>{t("pricing.max_listings")}</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="1"
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subscription.premium.features.maxImages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-1">
                              <Camera className="h-4 w-4" />
                              <span>{t("pricing.max_images")}</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="1"
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subscription.premium.features.promotedListings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-1">
                              <Megaphone className="h-4 w-4" />
                              <span>{t("pricing.promoted_listings")}</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="subscription.premium.features.priority"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel>
                                {t("pricing.features.priority_support")}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="subscription.premium.features.analytics"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel>
                                {t("pricing.features.analytics")}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormField
                          control={form.control}
                          name="subscription.premium.features.verification"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel>
                                {t("pricing.features.verification")}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="subscription.premium.features.support"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel>
                                {t("pricing.features.dedicated_support")}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Free User Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <span>{t("pricing.free_user_limits")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="freeUser.maxListings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("pricing.max_listings")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="freeUser.maxImages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("pricing.max_images_per_listing")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="freeUser.listingDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("pricing.listing_duration_days")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Commission Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t("pricing.commission_settings")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="commissions.enableCommissions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>{t("pricing.enable_commissions")}</FormLabel>
                        <FormDescription>
                          {t("pricing.commission_description")}
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
                  name="commissions.commissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("pricing.commission_rate")} (%)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          disabled={
                            !form.watch("commissions.enableCommissions")
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commissions.minimumCommission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("pricing.minimum_commission")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          disabled={
                            !form.watch("commissions.enableCommissions")
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
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
            {t("common.save_settings")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
