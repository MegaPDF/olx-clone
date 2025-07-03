// Admin schemas
import { z } from 'zod';
import { localizedContentSchema } from './category';

// Admin settings validation
export const adminSettingsSchema = z.object({
  general: z.object({
    siteName: z.string().min(1).max(100),
    siteDescription: z.string().min(1).max(500),
    siteUrl: z.string().url(),
    contactEmail: z.string().email(),
    supportEmail: z.string().email(),
    maintenanceMode: z.boolean(),
    registrationEnabled: z.boolean()
  }),
  pricing: z.object({
    promotion: z.object({
      featured: z.object({
        price: z.number().min(0),
        duration: z.number().min(1).max(30)
      }),
      urgent: z.object({
        price: z.number().min(0),
        duration: z.number().min(1).max(30)
      }),
      highlight: z.object({
        price: z.number().min(0),
        duration: z.number().min(1).max(30)
      })
    }),
    subscription: z.object({
      basic: z.object({
        monthly: z.number().min(0),
        yearly: z.number().min(0),
        features: z.object({
          maxListings: z.number().min(1),
          maxImages: z.number().min(1),
          promotedListings: z.number().min(0)
        })
      }),
      premium: z.object({
        monthly: z.number().min(0),
        yearly: z.number().min(0),
        features: z.object({
          maxListings: z.number().min(1),
          maxImages: z.number().min(1),
          promotedListings: z.number().min(0)
        })
      })
    })
  }),
  limits: z.object({
    freeUser: z.object({
      maxListings: z.number().min(1),
      maxImages: z.number().min(1),
      listingDuration: z.number().min(1)
    }),
    imageUpload: z.object({
      maxSize: z.number().min(1024), // At least 1KB
      allowedTypes: z.array(z.string()),
      maxDimensions: z.object({
        width: z.number().min(100),
        height: z.number().min(100)
      })
    })
  }),
  features: z.object({
    chat: z.boolean(),
    favorites: z.boolean(),
    reports: z.boolean(),
    promotions: z.boolean(),
    subscriptions: z.boolean(),
    geolocation: z.boolean(),
    notifications: z.boolean()
  })
});

// Report resolution validation
export const reportResolutionSchema = z.object({
  reportId: z.string().min(1, 'Report ID is required'),
  action: z.enum(['no_action', 'warning', 'content_removed', 'user_suspended', 'user_banned']),
  note: z.string().min(10, 'Resolution note must be at least 10 characters').max(1000)
});

// Create report validation
export const createReportSchema = z.object({
  targetType: z.enum(['listing', 'user', 'message']),
  targetId: z.string().min(1, 'Target ID is required'),
  category: z.enum(['spam', 'inappropriate', 'fraud', 'duplicate', 'other']),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
  evidence: z.object({
    screenshots: z.array(z.string().url()).max(5).optional(),
    additionalInfo: z.string().max(1000).optional()
  }).optional()
});

// Create notification validation
export const createNotificationSchema = z.object({
  recipient: z.string().min(1, 'Recipient ID is required'),
  type: z.enum(['message', 'listing_update', 'payment', 'promotion', 'system', 'favorite']),
  title: localizedContentSchema,
  message: localizedContentSchema,
  data: z.object({
    listingId: z.string().optional(),
    messageId: z.string().optional(),
    paymentId: z.string().optional(),
    userId: z.string().optional(),
    actionUrl: z.string().url().optional()
  }).optional(),
  channels: z.object({
    push: z.boolean().optional(),
    email: z.boolean().optional(),
    sms: z.boolean().optional()
  }).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional()
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional()
});