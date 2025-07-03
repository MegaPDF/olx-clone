// User schemas
import { z } from 'zod';
import { locationSchema } from './auth';
import { SUPPORTED_LOCALES, SUPPORTED_CURRENCIES } from '../constants';

// User preferences schema
export const userPreferencesSchema = z.object({
  language: z.enum(SUPPORTED_LOCALES as [string, ...string[]]),
  currency: z.enum(SUPPORTED_CURRENCIES as [string, ...string[]]),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean()
  }),
  theme: z.enum(['light', 'dark', 'system'])
});

// Update user profile validation
export const updateUserProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .optional(),
  phone: z.string()
    .regex(/^\+?[\d\s-()]{8,}$/, 'Invalid phone number format')
    .optional(),
  location: locationSchema.partial().optional(),
  preferences: userPreferencesSchema.partial().optional()
});

// Admin user management validation
export const adminUpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['user', 'admin', 'moderator']).optional(),
  status: z.enum(['active', 'suspended', 'banned']).optional(),
  location: locationSchema.partial().optional()
});
