// Global/utility types
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

// Base utility types
export type Locale = 'en' | 'id';
export type Currency = 'USD' | 'IDR';
export type Theme = 'light' | 'dark' | 'system';

// Localized content type
export interface LocalizedContent {
  en: string;
  id: string;
}

// Coordinates interface
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Location interface (used across multiple models)
export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates: Coordinates;
}

// Price interface (used in listings and payments)
export interface Price {
  amount: number;
  currency: Currency;
  negotiable?: boolean;
}

// Pagination interfaces
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Search and filter interfaces
export interface SearchParams {
  q?: string;
  category?: string;
  location?: {
    city?: string;
    radius?: number;
    coordinates?: Coordinates;
  };
  price?: {
    min?: number;
    max?: number;
  };
  condition?: string[];
  sort?: 'price' | 'date' | 'relevance' | 'distance';
  order?: 'asc' | 'desc';
}

// File upload interfaces
export interface UploadedFile {
  url: string;
  key: string;
  size: number;
  type: string;
  name: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

// Navigation and menu interfaces
export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  children?: NavItem[];
  disabled?: boolean;
  external?: boolean;
}

export interface Breadcrumb {
  title: string;
  href?: string;
}

// Form interfaces
export interface FormError {
  field: string;
  message: string;
}

export interface FormState<T = any> {
  data: T;
  errors: FormError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Component prop interfaces
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface PageProps {
  params: { [key: string]: string | string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Status enums and types
export type UserStatus = 'active' | 'suspended' | 'banned';
export type UserRole = 'user' | 'admin' | 'moderator';
export type ListingStatus = 'draft' | 'active' | 'sold' | 'expired' | 'suspended';
export type ListingCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'paused';
export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';
export type NotificationStatus = 'unread' | 'read' | 'sent';
export type ConversationStatus = 'active' | 'archived' | 'blocked';
