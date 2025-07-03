// Report model
import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  _id: string;
  reporter: mongoose.Types.ObjectId;
  target: {
    type: 'listing' | 'user' | 'message';
    id: mongoose.Types.ObjectId;
    title?: string;
  };
  category: 'spam' | 'inappropriate' | 'fraud' | 'duplicate' | 'other';
  reason: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  moderator?: mongoose.Types.ObjectId;
  resolution?: {
    action: 'no_action' | 'warning' | 'content_removed' | 'user_suspended' | 'user_banned';
    note: string;
    date: Date;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  evidence?: {
    screenshots: string[];
    additionalInfo: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  target: {
    type: { type: String, required: true, enum: ['listing', 'user', 'message'] },
    id: { type: Schema.Types.ObjectId, required: true, refPath: 'target.type' },
    title: String
  },
  category: {
    type: String,
    required: true,
    enum: ['spam', 'inappropriate', 'fraud', 'duplicate', 'other']
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
    index: true
  },
  moderator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    action: { type: String, enum: ['no_action', 'warning', 'content_removed', 'user_suspended', 'user_banned'] },
    note: String,
    date: Date
  },
  priority: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high', 'urgent']
  },
  evidence: {
    screenshots: [String],
    additionalInfo: String
  }
}, {
  timestamps: true
});

// Indexes
ReportSchema.index({ status: 1, priority: 1, createdAt: -1 });
ReportSchema.index({ 'target.type': 1, 'target.id': 1 });

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

