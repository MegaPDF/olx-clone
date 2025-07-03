// Notification model
import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  _id: string;
  recipient: mongoose.Types.ObjectId;
  type: 'message' | 'listing_update' | 'payment' | 'promotion' | 'system' | 'favorite';
  title: {
    en: string;
    id: string;
  };
  message: {
    en: string;
    id: string;
  };
  data?: {
    listingId?: mongoose.Types.ObjectId;
    messageId?: mongoose.Types.ObjectId;
    paymentId?: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    actionUrl?: string;
  };
  status: {
    read: boolean;
    readAt?: Date;
    sent: boolean;
    sentAt?: Date;
  };
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['message', 'listing_update', 'payment', 'promotion', 'system', 'favorite'],
    index: true
  },
  title: {
    en: { type: String, required: true },
    id: { type: String, required: true }
  },
  message: {
    en: { type: String, required: true },
    id: { type: String, required: true }
  },
  data: {
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing' },
    messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    actionUrl: String
  },
  status: {
    read: { type: Boolean, default: false },
    readAt: Date,
    sent: { type: Boolean, default: false },
    sentAt: Date
  },
  channels: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false }
  },
  priority: {
    type: String,
    default: 'normal',
    enum: ['low', 'normal', 'high', 'urgent']
  },
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes
NotificationSchema.index({ recipient: 1, 'status.read': 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

