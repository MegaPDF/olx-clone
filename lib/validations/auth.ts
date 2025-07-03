// Auth-related schemas
import { z } from 'zod';
import { SUPPORTED_LOCALES, SUPPORTED_CURRENCIES } from '../constants';

// Base location schema (reused across validations)
export const locationSchema = z.object({
  address: z.string().min(1, 'Address is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  country: z.string().min(1, 'Country is required').max(100),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  })
});

// User preferences schema for signup
export const signupPreferencesSchema = z.object({
  language: z.enum(SUPPORTED_LOCALES as [string, ...string[]]).optional(),
  currency: z.enum(SUPPORTED_CURRENCIES as [string, ...string[]]).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional()
  }).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional()
}).optional();

// Sign in validation
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional()
});

// Sign up validation
export const signUpSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string(),
  phone: z.string()
    .regex(/^\+?[\d\s-()]{8,}$/, 'Invalid phone number format')
    .optional(),
  location: locationSchema,
  preferences: signupPreferencesSchema,
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
  newsletter: z.boolean().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Password reset validation
export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

// New password validation
export const newPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Change password validation
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Email verification validation
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
});

// Phone verification validation
export const phoneVerificationSchema = z.object({
  phone: z.string()
    .regex(/^\+?[\d\s-()]{8,}$/, 'Invalid phone number format'),
  token: z.string().length(6, 'Verification code must be 6 digits').optional()
});