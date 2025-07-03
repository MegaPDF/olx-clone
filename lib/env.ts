// Environment variable validation

import { z } from 'zod';

// Environment schema validation
const envSchema = z.object({
  // App configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  
  // Database
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  MONGODB_DB_NAME: z.string().min(1, 'MongoDB database name is required'),
  
  // Authentication
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters'),
  
  // OAuth providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  
  // AWS S3
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS Access Key ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS Secret Access Key is required'),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET_NAME: z.string().min(1, 'AWS S3 bucket name is required'),
  AWS_CLOUDFRONT_URL: z.string().url().optional(),
  
  // Stripe
  STRIPE_PUBLIC_KEY: z.string().min(1, 'Stripe public key is required'),
  STRIPE_SECRET_KEY: z.string().min(1, 'Stripe secret key is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'Stripe webhook secret is required'),
  
  // Email service
  EMAIL_PROVIDER: z.enum(['smtp', 'sendgrid', 'ses']).default('smtp'),
  EMAIL_FROM: z.string().email('Valid email address required'),
  EMAIL_FROM_NAME: z.string().default('OLX Marketplace'),
  
  // SMTP (if using SMTP provider)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  
  // SendGrid (if using SendGrid provider)
  SENDGRID_API_KEY: z.string().optional(),
  
  // Real-time messaging
  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  PUSHER_CLUSTER: z.string().default('us2'),
  NEXT_PUBLIC_PUSHER_KEY: z.string().optional(),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().default('us2'),
  
  // Analytics
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_FACEBOOK_PIXEL_ID: z.string().optional(),
  
  // Maps
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  
  // Security
  ENCRYPTION_KEY: z.string().min(32, 'Encryption key must be at least 32 characters'),
  
  // Rate limiting
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional()
});

// Parse and validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `Invalid environment variables:\n${missingVars.join('\n')}\n\nPlease check your .env file.`
      );
    }
    throw error;
  }
}

export const env = validateEnv();

// Helper to check if OAuth providers are configured
export const oauthConfig = {
  google: {
    enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET
  },
  facebook: {
    enabled: !!(env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET),
    appId: env.FACEBOOK_APP_ID,
    appSecret: env.FACEBOOK_APP_SECRET
  }
};

// Helper to check if email service is configured
export const emailConfig = {
  provider: env.EMAIL_PROVIDER,
  configured: (() => {
    switch (env.EMAIL_PROVIDER) {
      case 'smtp':
        return !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);
      case 'sendgrid':
        return !!env.SENDGRID_API_KEY;
      case 'ses':
        return !!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY);
      default:
        return false;
    }
  })()
};

// Helper to check if real-time messaging is configured
export const pusherConfig = {
  enabled: !!(env.PUSHER_APP_ID && env.PUSHER_KEY && env.PUSHER_SECRET),
  appId: env.PUSHER_APP_ID,
  key: env.PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.PUSHER_CLUSTER
};
