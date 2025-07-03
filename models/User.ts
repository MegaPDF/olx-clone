// User model

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  password?: string;
  name: string;
  avatar?: string;
  phone?: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  preferences: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    theme: 'light' | 'dark' | 'system';
  };
  verification: {
    email: {
      verified: boolean;
      token?: string;
      expiresAt?: Date;
    };
    phone: {
      verified: boolean;
      token?: string;
      expiresAt?: Date;
    };
  };
  oauth: {
    google?: {
      id: string;
      email: string;
    };
    facebook?: {
      id: string;
      email: string;
    };
  };
  subscription?: {
    plan: 'free' | 'basic' | 'premium';
    status: 'active' | 'cancelled' | 'expired';
    expiresAt?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  stats: {
    totalListings: number;
    activeListings: number;
    soldListings: number;
    totalViews: number;
    rating: number;
    reviewCount: number;
  };
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'suspended' | 'banned';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    select: false // Don't include in queries by default
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    sparse: true,
    unique: true
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    country: { type: String, required: true, default: 'Indonesia' },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  },
  preferences: {
    language: { type: String, default: 'en', enum: ['en', 'id'] },
    currency: { type: String, default: 'USD', enum: ['USD', 'IDR'] },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    theme: { type: String, default: 'system', enum: ['light', 'dark', 'system'] }
  },
  verification: {
    email: {
      verified: { type: Boolean, default: false },
      token: String,
      expiresAt: Date
    },
    phone: {
      verified: { type: Boolean, default: false },
      token: String,
      expiresAt: Date
    }
  },
  oauth: {
    google: {
      id: String,
      email: String
    },
    facebook: {
      id: String,
      email: String
    }
  },
  subscription: {
    plan: { type: String, default: 'free', enum: ['free', 'basic', 'premium'] },
    status: { type: String, default: 'active', enum: ['active', 'cancelled', 'expired'] },
    expiresAt: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String
  },
  stats: {
    totalListings: { type: Number, default: 0 },
    activeListings: { type: Number, default: 0 },
    soldListings: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 }
  },
  role: { type: String, default: 'user', enum: ['user', 'admin', 'moderator'] },
  status: { type: String, default: 'active', enum: ['active', 'suspended', 'banned'] },
  lastLoginAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
UserSchema.index({ 'location.coordinates': '2dsphere' });
UserSchema.index({ email: 1, status: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
