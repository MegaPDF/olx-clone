import { Coordinates, GeoLocation, ListingCondition, ListingStatus, LocalizedContent, Price } from "./global";

// Listing types
export interface CreateListing {
  title: string;
  description: string;
  price: Price;
  category: string;
  condition: ListingCondition;
  images: string[];
  location: GeoLocation;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export interface UpdateListing extends Partial<CreateListing> {
  id: string;
  status?: ListingStatus;
}

export interface ListingDetail {
  id: string;
  title: string;
  description: string;
  price: Price;
  images: string[];
  category: {
    id: string;
    name: LocalizedContent;
    slug: string;
  };
  condition: ListingCondition;
  seller: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    reviewCount: number;
    memberSince: Date;
    location: {
      city: string;
      state: string;
    };
  };
  location: GeoLocation;
  status: ListingStatus;
  features: {
    promoted: {
      isPromoted: boolean;
      expiresAt?: Date;
      type?: 'featured' | 'urgent' | 'highlight';
    };
    verified: boolean;
  };
  stats: {
    views: number;
    favorites: number;
    contacts: number;
    shares: number;
  };
  seo: {
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
  };
  isFavorited?: boolean;
  isOwner?: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListingCard {
  id: string;
  title: string;
  price: Price;
  images: string[];
  location: {
    city: string;
    state: string;
  };
  condition: ListingCondition;
  features: {
    promoted: {
      isPromoted: boolean;
      type?: 'featured' | 'urgent' | 'highlight';
    };
    verified: boolean;
  };
  stats: {
    views: number;
    favorites: number;
  };
  isFavorited?: boolean;
  createdAt: Date;
}

export interface ListingFilters {
  category?: string;
  condition?: ListingCondition[];
  priceRange?: {
    min: number;
    max: number;
  };
  location?: {
    city?: string;
    radius?: number;
    coordinates?: Coordinates;
  };
  features?: {
    promoted?: boolean;
    verified?: boolean;
  };
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface ListingStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  expiredListings: number;
  promotedListings: number;
  averagePrice: number;
  listingsByCategory: { category: string; count: number }[];
  listingsByLocation: { city: string; count: number }[];
  recentListings: ListingCard[];
}

export interface PromoteListing {
  listingId: string;
  type: 'featured' | 'urgent' | 'highlight';
  duration: number; // days
}