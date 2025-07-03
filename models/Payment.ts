// Payment model
import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  type: 'promotion' | 'subscription' | 'featured_listing';
  amount: {
    value: number;
    currency: string;
  };
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  provider: {
    name: 'stripe';
    transactionId: string;
    paymentIntentId?: string;
    paymentMethodId?: string;
  };
  metadata: {
    listingId?: mongoose.Types.ObjectId;
    subscriptionId?: mongoose.Types.ObjectId;
    promotionType?: 'featured' | 'urgent' | 'highlight';
    duration?: number; // in days
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

const PaymentSchema = new Schema<IPayment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['promotion', 'subscription', 'featured_listing']
  },
  amount: {
    value: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, enum: ['USD', 'IDR'] }
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    index: true
  },
  provider: {
    name: { type: String, default: 'stripe' },
    transactionId: { type: String, required: true, unique: true },
    paymentIntentId: String,
    paymentMethodId: String
  },
  metadata: {
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing' },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    promotionType: { type: String, enum: ['featured', 'urgent', 'highlight'] },
    duration: Number
  },
  invoice: {
    number: { type: String, required: true, unique: true },
    downloadUrl: String
  },
  refund: {
    amount: Number,
    reason: String,
    processedAt: Date,
    refundId: String
  }
}, {
  timestamps: true
});

// Indexes
PaymentSchema.index({ user: 1, createdAt: -1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ 'provider.transactionId': 1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
