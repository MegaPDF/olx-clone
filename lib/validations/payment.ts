// Payment schemas
import { z } from 'zod';

// Create payment validation
export const createPaymentSchema = z.object({
  type: z.enum(['promotion', 'subscription', 'featured_listing']),
  amount: z.object({
    value: z.number().min(0.01, 'Amount must be greater than 0'),
    currency: z.enum(['USD', 'IDR'])
  }),
  metadata: z.object({
    listingId: z.string().optional(),
    subscriptionId: z.string().optional(),
    promotionType: z.enum(['featured', 'urgent', 'highlight']).optional(),
    duration: z.number().min(1).max(30).optional()
  })
});

// Subscription plan validation
export const subscriptionPlanSchema = z.object({
  plan: z.enum(['basic', 'premium']),
  interval: z.enum(['monthly', 'yearly'])
});

// Refund request validation
export const refundRequestSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  amount: z.number().min(0.01).optional(),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500)
});
