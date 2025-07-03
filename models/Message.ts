// Message model
import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: {
    text?: string;
    type: 'text' | 'image' | 'system';
    attachments?: string[];
  };
  status: {
    sent: boolean;
    delivered: boolean;
    read: boolean;
    readAt?: Date;
  };
  metadata?: {
    systemType?: 'listing_sold' | 'listing_updated' | 'user_joined';
    editedAt?: Date;
    originalContent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: String,
    type: { type: String, required: true, enum: ['text', 'image', 'system'] },
    attachments: [String]
  },
  status: {
    sent: { type: Boolean, default: true },
    delivered: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    readAt: Date
  },
  metadata: {
    systemType: { type: String, enum: ['listing_sold', 'listing_updated', 'user_joined'] },
    editedAt: Date,
    originalContent: String
  }
}, {
  timestamps: true
});

// Indexes
MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
