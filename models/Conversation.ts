// Conversation model
import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  _id: string;
  participants: mongoose.Types.ObjectId[];
  listing: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  status: 'active' | 'archived' | 'blocked';
  metadata: {
    participantNames: string[];
    listingTitle: string;
    listingImage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  listing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'archived', 'blocked']
  },
  metadata: {
    participantNames: [String],
    listingTitle: String,
    listingImage: String
  }
}, {
  timestamps: true
});

// Indexes
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ listing: 1 });
ConversationSchema.index({ updatedAt: -1 });

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

