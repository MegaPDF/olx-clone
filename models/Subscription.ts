// Subscription model
import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  plan: {
    name: 'basic' | 'premium';
    price: {
      amount: number;
      currency: string;
      interval: 'monthly' | 'yearly';
    };
    features: {
      maxListings: number;
      maxImages: number;
      promotedListings: number;
      priority: boolean;
      analytics: boolean;
    };
  };
  status: 'active' | 'cancelled' | 'expired' | 'paused';
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
  history: [{
    action: 'created' | 'upgraded' | 'downgraded' | 'cancelled' | 'renewed';
    date: Date;
    previousPlan?: string;
    reason?: string;
  }];
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  plan: {
    name: { type: String, required: true, enum: ['basic', 'premium'] },
    price: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true, enum: ['USD', 'IDR'] },
      interval: { type: String, required: true, enum: ['monthly', 'yearly'] }
    },
    features: {
      maxListings: { type: Number, required: true },
      maxImages: { type: Number, required: true },
      promotedListings: { type: Number, required: true },
      priority: { type: Boolean, default: false },
      analytics: { type: Boolean, default: false }
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'cancelled', 'expired', 'paused'],
    index: true
  },
  billing: {
    stripeCustomerId: { type: String, required: true },
    stripeSubscriptionId: { type: String, required: true, unique: true },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false }
  },
  usage: {
    currentListings: { type: Number, default: 0 },
    promotedListingsUsed: { type: Number, default: 0 },
    resetDate: { type: Date, required: true }
  },
  history: [{
    action: { type: String, enum: ['created', 'upgraded', 'downgraded', 'cancelled', 'renewed'] },
    date: { type: Date, default: Date.now },
    previousPlan: String,
    reason: String
  }]
}, {
  timestamps: true
});

// Indexes
SubscriptionSchema.index({ status: 1, 'billing.currentPeriodEnd': 1 });

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

