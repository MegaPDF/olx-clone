import { Currency, PaymentStatus, SubscriptionStatus } from "./global";

// Payment types
export interface CreatePayment {
  type: 'promotion' | 'subscription' | 'featured_listing';
  amount: {
    value: number;
    currency: Currency;
  };
  metadata: {
    listingId?: string;
    subscriptionId?: string;
    promotionType?: 'featured' | 'urgent' | 'highlight';
    duration?: number;
  };
}

export interface PaymentDetail {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  type: 'promotion' | 'subscription' | 'featured_listing';
  amount: {
    value: number;
    currency: Currency;
  };
  status: PaymentStatus;
  provider: {
    name: 'stripe';
    transactionId: string;
    paymentIntentId?: string;
    paymentMethodId?: string;
  };
  metadata: {
    listingId?: string;
    subscriptionId?: string;
    promotionType?: 'featured' | 'urgent' | 'highlight';
    duration?: number;
  };
  invoice: {
    number: string;
    downloadUrl?: string;
  };
  refund?: {
    amount: number;
    reason: string;
    processedAt: Date;
    refundId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  name: 'basic' | 'premium';
  price: {
    amount: number;
    currency: Currency;
    interval: 'monthly' | 'yearly';
  };
  features: {
    maxListings: number;
    maxImages: number;
    promotedListings: number;
    priority: boolean;
    analytics: boolean;
  };
  popular?: boolean;
  discount?: {
    percentage: number;
    validUntil: Date;
  };
}

export interface SubscriptionDetail {
  id: string;
  user: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billing: {
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  };
  usage: {
    currentListings: number;
    promotedListingsUsed: number;
    resetDate: Date;
  };
  history: Array<{
    action: 'created' | 'upgraded' | 'downgraded' | 'cancelled' | 'renewed';
    date: Date;
    previousPlan?: string;
    reason?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalTransactions: number;
  pendingPayments: number;
  refundedAmount: number;
  revenueByType: Array<{
    type: 'promotion' | 'subscription' | 'featured_listing';
    amount: number;
    count: number;
  }>;
  recentPayments: PaymentDetail[];
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
  expiresAt: Date;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason: string;
}
