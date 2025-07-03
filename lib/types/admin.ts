import { Currency, LocalizedContent, ReportStatus } from "./global";

// Admin types
export interface AdminDashboardStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    growth: number; // percentage
  };
  listings: {
    total: number;
    active: number;
    sold: number;
    expired: number;
    newToday: number;
    growth: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    avgOrderValue: number;
  };
  activity: {
    messages: number;
    reports: number;
    pendingReports: number;
    activeChats: number;
  };
}

export interface AdminSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    contactEmail: string;
    supportEmail: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
  };
  aws: {
    region: string;
    bucketName: string;
    cloudFrontUrl?: string;
  };
  stripe: {
    currency: Currency;
  };
  oauth: {
    google: {
      enabled: boolean;
    };
    facebook: {
      enabled: boolean;
    };
  };
  email: {
    provider: 'smtp' | 'sendgrid' | 'ses';
    fromEmail: string;
    fromName: string;
  };
  pricing: {
    promotion: {
      featured: { price: number; duration: number };
      urgent: { price: number; duration: number };
      highlight: { price: number; duration: number };
    };
    subscription: {
      basic: {
        monthly: number;
        yearly: number;
        features: {
          maxListings: number;
          maxImages: number;
          promotedListings: number;
        };
      };
      premium: {
        monthly: number;
        yearly: number;
        features: {
          maxListings: number;
          maxImages: number;
          promotedListings: number;
        };
      };
    };
  };
  limits: {
    freeUser: {
      maxListings: number;
      maxImages: number;
      listingDuration: number;
    };
    imageUpload: {
      maxSize: number;
      allowedTypes: string[];
      maxDimensions: { width: number; height: number };
    };
  };
  features: {
    chat: boolean;
    favorites: boolean;
    reports: boolean;
    promotions: boolean;
    subscriptions: boolean;
    geolocation: boolean;
    notifications: boolean;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
    ogImage: string;
  };
  analytics: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    enabled: boolean;
  };
}

export interface ReportDetail {
  id: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  target: {
    type: 'listing' | 'user' | 'message';
    id: string;
    title?: string;
    url?: string;
  };
  category: 'spam' | 'inappropriate' | 'fraud' | 'duplicate' | 'other';
  reason: string;
  status: ReportStatus;
  moderator?: {
    id: string;
    name: string;
  };
  resolution?: {
    action: 'no_action' | 'warning' | 'content_removed' | 'user_suspended' | 'user_banned';
    note: string;
    date: Date;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  evidence?: {
    screenshots: string[];
    additionalInfo: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReport {
  targetType: 'listing' | 'user' | 'message';
  targetId: string;
  category: 'spam' | 'inappropriate' | 'fraud' | 'duplicate' | 'other';
  reason: string;
  evidence?: {
    screenshots: string[];
    additionalInfo: string;
  };
}

export interface NotificationDetail {
  id: string;
  recipient: string;
  type: 'message' | 'listing_update' | 'payment' | 'promotion' | 'system' | 'favorite';
  title: LocalizedContent;
  message: LocalizedContent;
  data?: {
    listingId?: string;
    messageId?: string;
    paymentId?: string;
    userId?: string;
    actionUrl?: string;
  };
  status: {
    read: boolean;
    readAt?: Date;
    sent: boolean;
    sentAt?: Date;
  };
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotification {
  recipient: string;
  type: 'message' | 'listing_update' | 'payment' | 'promotion' | 'system' | 'favorite';
  title: LocalizedContent;
  message: LocalizedContent;
  data?: {
    listingId?: string;
    messageId?: string;
    paymentId?: string;
    userId?: string;
    actionUrl?: string;
  };
  channels?: {
    push?: boolean;
    email?: boolean;
    sms?: boolean;
  };
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}