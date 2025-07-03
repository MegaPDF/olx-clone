import { Currency, GeoLocation, ListingStatus, Locale, Price, SubscriptionStatus, Theme, UserRole, UserStatus } from "./global";

// User types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  location: GeoLocation;
  preferences: {
    language: Locale;
    currency: Currency;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    theme: Theme;
  };
  verification: {
    email: {
      verified: boolean;
      token?: string;
      expiresAt?: Date;
    };
    phone: {
      verified: boolean;
      token?: string;
      expiresAt?: Date;
    };
  };
  stats: {
    totalListings: number;
    activeListings: number;
    soldListings: number;
    totalViews: number;
    rating: number;
    reviewCount: number;
  };
  subscription?: {
    plan: 'free' | 'basic' | 'premium';
    status: SubscriptionStatus;
    expiresAt?: Date;
  };
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfile {
  name?: string;
  phone?: string;
  location?: Partial<GeoLocation>;
  preferences?: {
    language?: Locale;
    currency?: Currency;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
    theme?: Theme;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByCountry: { country: string; count: number }[];
  usersByRole: { role: UserRole; count: number }[];
}

export interface UserListingStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  expiredListings: number;
  totalViews: number;
  averagePrice: number;
  recentListings: Array<{
    id: string;
    title: string;
    price: Price;
    status: ListingStatus;
    createdAt: Date;
  }>;
}