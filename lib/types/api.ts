import { AdminDashboardStats, AdminSettings, NotificationDetail, ReportDetail } from ".";
import { CategoryDetail } from "./category";
import { FormError, ListingCondition } from "./global";
import { ListingCard, ListingDetail } from "./listing";
import { ConversationDetail, MessageDetail } from "./message";
import { PaymentDetail, SubscriptionDetail } from "./payment";
import { UserProfile } from "./user";

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// Paginated API response
export interface ApiPaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error response structure
export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

// Request/Response types for specific endpoints
export interface AuthApiResponse extends ApiResponse<{
  user: UserProfile;
  token?: string;
  expiresAt?: Date;
}> {}

export interface ListingApiResponse extends ApiResponse<ListingDetail> {}
export interface ListingsApiResponse extends ApiPaginatedResponse<ListingCard> {}

export interface CategoryApiResponse extends ApiResponse<CategoryDetail> {}
export interface CategoriesApiResponse extends ApiResponse<CategoryDetail[]> {}

export interface ConversationApiResponse extends ApiResponse<ConversationDetail> {}
export interface ConversationsApiResponse extends ApiResponse<ConversationDetail[]> {}

export interface MessagesApiResponse extends ApiPaginatedResponse<MessageDetail> {}

export interface PaymentApiResponse extends ApiResponse<PaymentDetail> {}
export interface PaymentsApiResponse extends ApiPaginatedResponse<PaymentDetail> {}

export interface SubscriptionApiResponse extends ApiResponse<SubscriptionDetail> {}

export interface ReportApiResponse extends ApiResponse<ReportDetail> {}
export interface ReportsApiResponse extends ApiPaginatedResponse<ReportDetail> {}

export interface NotificationApiResponse extends ApiResponse<NotificationDetail> {}
export interface NotificationsApiResponse extends ApiPaginatedResponse<NotificationDetail> {}

export interface AdminStatsApiResponse extends ApiResponse<AdminDashboardStats> {}
export interface AdminSettingsApiResponse extends ApiResponse<AdminSettings> {}

// Upload API responses
export interface UploadApiResponse extends ApiResponse<{
  url: string;
  key: string;
  size: number;
  type: string;
}> {}

export interface MultiUploadApiResponse extends ApiResponse<Array<{
  url: string;
  key: string;
  size: number;
  type: string;
  originalName: string;
}>> {}

// Search API response
export interface SearchApiResponse extends ApiPaginatedResponse<ListingCard> {
  filters: {
    categories: Array<{ id: string; name: string; count: number }>;
    locations: Array<{ city: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
    conditions: Array<{ condition: ListingCondition; count: number }>;
  };
  suggestions?: string[];
}

// Analytics API responses
export interface AnalyticsApiResponse extends ApiResponse<{
  period: string;
  metrics: Record<string, number>;
  charts: Array<{
    name: string;
    data: Array<{ date: string; value: number }>;
  }>;
}> {}

// Webhook payload types
export interface StripeWebhookPayload {
  id: string;
  object: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

// Real-time event types
export interface RealTimeEvent {
  type: 'message' | 'notification' | 'listing_update' | 'user_status';
  userId: string;
  data: any;
  timestamp: Date;
}

// File validation types
export interface FileValidation {
  maxSize: number;
  allowedTypes: string[];
  maxFiles?: number;
  dimensions?: {
    maxWidth: number;
    maxHeight: number;
    minWidth?: number;
    minHeight?: number;
  };
}

// Form submission types
export interface FormSubmissionResult<T = any> {
  success: boolean;
  data?: T;
  errors?: FormError[];
  redirect?: string;
}

// Utility type for making all properties optional except specified ones
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Utility type for creating update types
export type UpdateType<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;