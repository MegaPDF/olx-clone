// Category schemas
import { z } from 'zod';

// Localized content schema
export const localizedContentSchema = z.object({
  en: z.string().min(1, 'English content is required'),
  id: z.string().min(1, 'Indonesian content is required')
});

// Create category validation
export const createCategorySchema = z.object({
  name: localizedContentSchema,
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: localizedContentSchema.optional(),
  icon: z.string().optional(),
  image: z.string().url().optional(),
  parent: z.string().optional(),
  sortOrder: z.number().min(0).optional(),
  seo: z.object({
    title: localizedContentSchema.optional(),
    description: localizedContentSchema.optional(),
    keywords: z.array(z.string()).optional()
  }).optional()
});

// Update category validation
export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().min(1, 'Category ID is required'),
  isActive: z.boolean().optional()
});
