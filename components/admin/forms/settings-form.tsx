'use client';

import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { 
  Settings,
  Globe,
  Mail,
  Cloud,
  CreditCard,
  Shield,
  BarChart3,
  Users,
  Package,
  Plus,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { AdminSettings } from '@/lib/types/admin';
import type { Currency } from '@/lib/types/global';

interface SettingsFormProps {
  settings?: AdminSettings;
  onSubmit: (data: AdminSettings) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

const createSettingsSchema = (t: any) => z.object({
  general: z.object({
    siteName: z.string().min(1, t('validation.required')),
    siteDescription: z.string().min(1, t('validation.required')),
    siteUrl: z.string().url(t('validation.valid_url')),
    contactEmail: z.string().email(t('validation.valid_email')),
    supportEmail: z.string().email(t('validation.valid_email')),
    maintenanceMode: z.boolean(),
    registrationEnabled: z.boolean(),
  }),
  aws: z.object({
    region: z.string().min(1, t('validation.required')),
    bucketName: z.string().min(1, t('validation.required')),
    cloudFrontUrl: z.string().url(t('validation.valid_url')).or(z.literal('')),
  }),
  stripe: z.object({
    currency: z.enum(['USD', 'IDR']),
  }),
  oauth: z.object({
    google: z.object({
      enabled: z.boolean(),
    }),
    facebook: z.object({
      enabled: z.boolean(),
    }),
  }),
  email: z.object({
    provider: z.enum(['smtp', 'sendgrid', 'ses']),
    fromEmail: z.string().email(t('validation.valid_email')),
    fromName: z.string().min(1, t('validation.required')),
  }),
  features: z.object({
    chat: z.boolean(),
    favorites: z.boolean(),
    reports: z.boolean(),
    promotions: z.boolean(),
    subscriptions: z.boolean(),
    geolocation: z.boolean(),
    notifications: z.boolean(),
  }),
  seo: z.object({
    defaultTitle: z.string().min(1, t('validation.required')),
    defaultDescription: z.string().min(1, t('validation.required')),
    keywords: z.array(z.string()),
    ogImage: z.string().url(t('validation.valid_url')).or(z.literal('')),
  }),
  analytics: z.object({
    googleAnalyticsId: z.string(),
    facebookPixelId: z.string(),
    enabled: z.boolean(),
  }),
});

export function SettingsForm({
  settings,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className
}: SettingsFormProps) {
  const { t } = useTranslation(['admin', 'common']);
  const [keywords, setKeywords] = useState<string[]>(settings?.seo.keywords || []);
  const [newKeyword, setNewKeyword] = useState('');
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  const schema = createSettingsSchema(t);
  
  const form = useForm<AdminSettings>({
    resolver: zodResolver(schema),
    defaultValues: settings || {
      general: {
        siteName: 'OLX Marketplace',
        siteDescription: 'Buy and sell everything in your local area',
        siteUrl: 'https://your-domain.com',
        contactEmail: 'contact@your-domain.com',
        supportEmail: 'support@your-domain.com',
        maintenanceMode: false,
        registrationEnabled: true,
      },
      aws: {
        region: 'us-east-1',
        bucketName: '',
        cloudFrontUrl: '',
      },
      stripe: {
        currency: 'USD',
      },
      oauth: {
        google: { enabled: false },
        facebook: { enabled: false },
      },
      email: {
        provider: 'smtp',
        fromEmail: 'noreply@your-domain.com',
        fromName: 'OLX Marketplace',
      },
      features: {
        chat: true,
        favorites: true,
        reports: true,
        promotions: true,
        subscriptions: true,
        geolocation: true,
        notifications: true,
      },
      seo: {
        defaultTitle: 'OLX Marketplace - Buy & Sell Everything',
        defaultDescription: 'Find great deals on everything in your local area',
        keywords: [],
        ogImage: '',
      },
      analytics: {
        googleAnalyticsId: '',
        facebookPixelId: '',
        enabled: false,
      },
    },
  });

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      const updatedKeywords = [...keywords, newKeyword.trim()];
      setKeywords(updatedKeywords);
      form.setValue('seo.keywords', updatedKeywords);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    const updatedKeywords = keywords.filter(k => k !== keyword);
    setKeywords(updatedKeywords);
    form.setValue('seo.keywords', updatedKeywords);
  };

  const handleSubmit = async (data: AdminSettings) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={cn('space-y-6', className)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <span>{t('settings.general')}</span>
                </CardTitle>
                <CardDescription>
                  {t('settings.general_description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="general.siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.site_name')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="OLX Marketplace" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="general.siteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.site_url')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://your-domain.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="general.siteDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.site_description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Buy and sell everything in your local area"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="general.contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.contact_email')}</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="contact@your-domain.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="general.supportEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.support_email')}</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="support@your-domain.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex space-x-6">
                  <FormField
                    control={form.control}
                    name="general.maintenanceMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('settings.maintenance_mode')}</FormLabel>
                          <FormDescription>
                            {t('settings.maintenance_description')}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="general.registrationEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{t('settings.registration_enabled')}</FormLabel>
                          <FormDescription>
                            {t('settings.registration_description')}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* AWS Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cloud className="h-5 w-5 text-orange-600" />
                  <span>{t('settings.aws')}</span>
                </CardTitle>
                <CardDescription>
                  {t('settings.aws_description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="aws.region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.aws_region')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                            <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                            <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                            <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                            <SelectItem value="ap-southeast-2">Asia Pacific (Sydney)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="aws.bucketName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.s3_bucket')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="your-bucket-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="aws.cloudFrontUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.cloudfront_url')} ({t('common.optional')})</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://d123456789.cloudfront.net" />
                      </FormControl>
                      <FormDescription>
                        {t('settings.cloudfront_description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Email Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  <span>{t('settings.email')}</span>
                </CardTitle>
                <CardDescription>
                  {t('settings.email_description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email.provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.email_provider')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="smtp">SMTP</SelectItem>
                          <SelectItem value="sendgrid">SendGrid</SelectItem>
                          <SelectItem value="ses">Amazon SES</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email.fromEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.from_email')}</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="noreply@your-domain.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email.fromName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.from_name')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="OLX Marketplace" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  <span>{t('settings.seo')}</span>
                </CardTitle>
                <CardDescription>
                  {t('settings.seo_description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="seo.defaultTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.default_title')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="OLX Marketplace - Buy & Sell Everything" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seo.defaultDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.default_description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Find great deals on everything in your local area"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seo.ogImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.og_image')} ({t('common.optional')})</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://your-domain.com/og-image.jpg" />
                      </FormControl>
                      <FormDescription>
                        {t('settings.og_image_description')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <Label>{t('settings.seo_keywords')}</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder={t('settings.add_keyword')}
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    />
                    <Button type="button" variant="outline" onClick={addKeyword}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="px-2 py-1">
                          {keyword}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => removeKeyword(keyword)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            {/* Stripe & Currency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  <span>{t('settings.stripe')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="stripe.currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.default_currency')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
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

            {/* OAuth Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span>{t('settings.oauth')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="oauth.google.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Google OAuth</FormLabel>
                        <FormDescription>
                          {t('settings.google_oauth_description')}
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
                  name="oauth.facebook.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Facebook OAuth</FormLabel>
                        <FormDescription>
                          {t('settings.facebook_oauth_description')}
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

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-emerald-600" />
                  <span>{t('settings.features')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField
                  control={form.control}
                  name="features.chat"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <FormLabel>{t('settings.enable_chat')}</FormLabel>
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
                  name="features.favorites"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <FormLabel>{t('settings.enable_favorites')}</FormLabel>
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
                  name="features.reports"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <FormLabel>{t('settings.enable_reports')}</FormLabel>
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
                  name="features.promotions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <FormLabel>{t('settings.enable_promotions')}</FormLabel>
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
                  name="features.subscriptions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <FormLabel>{t('settings.enable_subscriptions')}</FormLabel>
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
                  name="features.geolocation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <FormLabel>{t('settings.enable_geolocation')}</FormLabel>
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
                  name="features.notifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <FormLabel>{t('settings.enable_notifications')}</FormLabel>
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

            {/* Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-yellow-600" />
                  <span>{t('settings.analytics')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="analytics.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>{t('settings.enable_analytics')}</FormLabel>
                        <FormDescription>
                          {t('settings.analytics_description')}
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
                  name="analytics.googleAnalyticsId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Analytics ID ({t('common.optional')})</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="G-XXXXXXXXXX"
                          disabled={!form.watch('analytics.enabled')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="analytics.facebookPixelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook Pixel ID ({t('common.optional')})</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="123456789012345"
                          disabled={!form.watch('analytics.enabled')}
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
              {t('common.cancel')}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />}
            {t('common.save_settings')}
          </Button>
        </div>
      </form>
    </Form>
  );
}