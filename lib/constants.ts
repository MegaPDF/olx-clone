// App constants
import type { 
  ListingCondition, 
  Currency, 
  Locale, 
  UserRole,
  ListingStatus,
  PaymentStatus 
} from './types';

// Application constants
export const APP_NAME = 'OLX Marketplace';
export const APP_DESCRIPTION = 'Buy and sell locally with ease';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Supported locales and currencies
export const SUPPORTED_LOCALES: Locale[] = ['en', 'id'];
export const DEFAULT_LOCALE: Locale = 'en';

export const SUPPORTED_CURRENCIES: Currency[] = ['USD', 'IDR'];
export const DEFAULT_CURRENCY: Currency = 'USD';

// Currency symbols
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  IDR: 'Rp'
};

// Locale to currency mapping
export const LOCALE_CURRENCY_MAP: Record<Locale, Currency> = {
  en: 'USD',
  id: 'IDR'
};

// User roles and permissions
export const USER_ROLES: UserRole[] = ['user', 'admin', 'moderator'];

export const ROLE_PERMISSIONS = {
  user: ['read', 'create_listing', 'message', 'favorite'],
  moderator: ['read', 'create_listing', 'message', 'favorite', 'moderate'],
  admin: ['read', 'create_listing', 'message', 'favorite', 'moderate', 'admin']
} as const;

// Listing constants
export const LISTING_CONDITIONS: ListingCondition[] = [
  'new', 'like-new', 'good', 'fair', 'poor'
];

export const LISTING_STATUSES: ListingStatus[] = [
  'draft', 'active', 'sold', 'expired', 'suspended'
];

export const PROMOTION_TYPES = ['featured', 'urgent', 'highlight'] as const;

// Payment constants
export const PAYMENT_STATUSES: PaymentStatus[] = [
  'pending', 'completed', 'failed', 'refunded', 'cancelled'
];

export const SUBSCRIPTION_PLANS = ['free', 'basic', 'premium'] as const;

// File upload limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGES_PER_LISTING = 10;
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const IMAGE_DIMENSIONS = {
  thumbnail: { width: 200, height: 200 },
  medium: { width: 500, height: 500 },
  large: { width: 1200, height: 1200 }
};

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Search constants
export const SEARCH_DEBOUNCE_MS = 300;
export const AUTOCOMPLETE_MIN_CHARS = 2;
export const MAX_SEARCH_RESULTS = 1000;

// Location constants
export const DEFAULT_SEARCH_RADIUS = 25; // kilometers
export const MAX_SEARCH_RADIUS = 100;

// Time constants
export const LISTING_DURATION_DAYS = 30;
export const TOKEN_EXPIRY_HOURS = 24;
export const SESSION_DURATION_DAYS = 30;

// Notification types
export const NOTIFICATION_TYPES = [
  'message',
  'listing_update',
  'payment',
  'promotion',
  'system',
  'favorite'
] as const;

// Email templates
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  EMAIL_VERIFICATION: 'email-verification',
  PASSWORD_RESET: 'password-reset',
  LISTING_APPROVED: 'listing-approved',
  LISTING_SOLD: 'listing-sold',
  PAYMENT_SUCCESS: 'payment-success',
  SUBSCRIPTION_EXPIRY: 'subscription-expiry'
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  LISTINGS: '/api/listings',
  CATEGORIES: '/api/categories',
  MESSAGES: '/api/messages',
  PAYMENTS: '/api/payments',
  ADMIN: '/api/admin',
  UPLOAD: '/api/upload'
} as const;

// External service URLs
export const EXTERNAL_URLS = {
  TERMS: '/terms',
  PRIVACY: '/privacy',
  SUPPORT: '/support',
  CONTACT: '/contact'
} as const;

// Feature flags (can be moved to database later)
export const FEATURES = {
  CHAT: true,
  FAVORITES: true,
  REPORTS: true,
  PROMOTIONS: true,
  SUBSCRIPTIONS: true,
  GEOLOCATION: true,
  NOTIFICATIONS: true,
  DARK_MODE: true,
  RTL_SUPPORT: false
} as const;

// Rate limiting
export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 60,
  LOGIN_ATTEMPTS_PER_HOUR: 5,
  LISTING_CREATION_PER_DAY: 10,
  MESSAGE_SENDING_PER_MINUTE: 10
} as const;

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  STATIC_CONTENT: 3600, // 1 hour
  LISTINGS: 300, // 5 minutes
  CATEGORIES: 1800, // 30 minutes
  USER_PROFILE: 600, // 10 minutes
  SEARCH_RESULTS: 180 // 3 minutes
} as const;
