// Listing schemas
import { z } from 'zod';
import { locationSchema } from './auth';
import { 
  LISTING_CONDITIONS, 
  MAX_IMAGES_PER_LISTING,
  ALLOWED_IMAGE_TYPES 
} from '../constants';

// Price schema
export const priceSchema = z.object({
  amount: z.number()
    .min(0, 'Price must be a positive number')
    .max(999999999, 'Price is too high'),
  currency: z.enum(['USD', 'IDR']),
  negotiable: z.boolean().optional()
});

// Create listing validation
export const createListingSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  price: priceSchema,
  category: z.string().min(1, 'Category is required'),
  condition: z.enum(LISTING_CONDITIONS as [string, ...string[]]),
  images: z.array(z.string().url())
    .min(1, 'At least one image is required')
    .max(MAX_IMAGES_PER_LISTING, `Maximum ${MAX_IMAGES_PER_LISTING} images allowed`),
  location: locationSchema,
  seo: z.object({
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional()
  }).optional()
});

// Update listing validation
export const updateListingSchema = createListingSchema.partial().extend({
  id: z.string().min(1, 'Listing ID is required'),
  status: z.enum(['draft', 'active', 'sold', 'expired', 'suspended']).optional()
});

// Listing filters validation
export const listingFiltersSchema = z.object({
  category: z.string().optional(),
  condition: z.array(z.enum(LISTING_CONDITIONS as [string, ...string[]])).optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0)
  }).optional(),
  location: z.object({
    city: z.string().optional(),
    radius: z.number().min(1).max(100).optional(),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180)
    }).optional()
  }).optional(),
  features: z.object({
    promoted: z.boolean().optional(),
    verified: z.boolean().optional()
  }).optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date()
  }).optional()
});

// Search validation
export const searchSchema = z.object({
  q: z.string().min(1).optional(),
  category: z.string().optional(),
  location: z.object({
    city: z.string().optional(),
    radius: z.number().min(1).max(100).optional(),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180)
    }).optional()
  }).optional(),
  price: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional()
  }).optional(),
  condition: z.array(z.string()).optional(),
  sort: z.enum(['price', 'date', 'relevance', 'distance']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional()
});

// Promote listing validation
export const promoteListingSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  type: z.enum(['featured', 'urgent', 'highlight']),
  duration: z.number().min(1).max(30) // 1-30 days
});
