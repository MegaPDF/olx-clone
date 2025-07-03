import { env } from '../lib/env';
import type { Currency } from '../lib/types';

interface StripeConfig {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  apiVersion: '2023-10-16';
  pricing: {
    currency: Currency;
    promotions: {
      featured: { price: number; duration: number };
      urgent: { price: number; duration: number };
      highlight: { price: number; duration: number };
    };
    subscriptions: {
      basic: {
        monthly: { price: number; priceId?: string };
        yearly: { price: number; priceId?: string; discount: number };
        features: {
          maxListings: number;
          maxImages: number;
          promotedListings: number;
          priority: boolean;
          analytics: boolean;
        };
      };
      premium: {
        monthly: { price: number; priceId?: string };
        yearly: { price: number; priceId?: string; discount: number };
        features: {
          maxListings: number;
          maxImages: number;
          promotedListings: number;
          priority: boolean;
          analytics: boolean;
        };
      };
    };
  };
  webhookEvents: string[];
  checkoutSettings: {
    sessionExpiration: number; // minutes
    allowPromotionCodes: boolean;
    collectShippingAddress: boolean;
    collectPhoneNumber: boolean;
  };
}

export const stripeConfig: StripeConfig = {
  publicKey: env.STRIPE_PUBLIC_KEY,
  secretKey: env.STRIPE_SECRET_KEY,
  webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  apiVersion: '2023-10-16',
  pricing: {
    currency: 'USD',
    promotions: {
      featured: { price: 5.00, duration: 7 },
      urgent: { price: 3.00, duration: 3 },
      highlight: { price: 2.00, duration: 7 }
    },
    subscriptions: {
      basic: {
        monthly: { price: 9.99 },
        yearly: { price: 99.99, discount: 17 }, // ~17% discount
        features: {
          maxListings: 50,
          maxImages: 10,
          promotedListings: 5,
          priority: false,
          analytics: true
        }
      },
      premium: {
        monthly: { price: 19.99 },
        yearly: { price: 199.99, discount: 17 }, // ~17% discount
        features: {
          maxListings: 200,
          maxImages: 20,
          promotedListings: 20,
          priority: true,
          analytics: true
        }
      }
    }
  },
  webhookEvents: [
    'checkout.session.completed',
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted'
  ],
  checkoutSettings: {
    sessionExpiration: 30, // 30 minutes
    allowPromotionCodes: true,
    collectShippingAddress: false,
    collectPhoneNumber: false
  }
};

// Stripe webhook event handlers mapping
export const stripeWebhookHandlers = {
  'checkout.session.completed': 'handleCheckoutCompleted',
  'payment_intent.succeeded': 'handlePaymentSucceeded',
  'payment_intent.payment_failed': 'handlePaymentFailed',
  'invoice.payment_succeeded': 'handleInvoicePaymentSucceeded',
  'invoice.payment_failed': 'handleInvoicePaymentFailed',
  'customer.subscription.created': 'handleSubscriptionCreated',
  'customer.subscription.updated': 'handleSubscriptionUpdated',
  'customer.subscription.deleted': 'handleSubscriptionDeleted'
} as const;

// Currency configurations
export const currencyConfig = {
  USD: {
    symbol: '$',
    decimal: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before'
  },
  IDR: {
    symbol: 'Rp',
    decimal: 0,
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolPosition: 'before'
  }
};
