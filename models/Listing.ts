// Listing model
import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
  _id: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    negotiable: boolean;
  };
  images: string[];
  category: mongoose.Types.ObjectId;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  seller: mongoose.Types.ObjectId;
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
  status: 'draft' | 'active' | 'sold' | 'expired' | 'suspended';
  features: {
    promoted: {
      isPromoted: boolean;
      expiresAt?: Date;
      type?: 'featured' | 'urgent' | 'highlight';
    };
    verified: boolean;
  };
  stats: {
    views: number;
    favorites: number;
    contacts: number;
    shares: number;
  };
  seo: {
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
  };
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: 'text'
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000,
    index: 'text'
  },
  price: {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, enum: ['USD', 'IDR'] },
    negotiable: { type: Boolean, default: false }
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'like-new', 'good', 'fair', 'poor']
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
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
  status: {
    type: String,
    default: 'active',
    enum: ['draft', 'active', 'sold', 'expired', 'suspended'],
    index: true
  },
  features: {
    promoted: {
      isPromoted: { type: Boolean, default: false },
      expiresAt: Date,
      type: { type: String, enum: ['featured', 'urgent', 'highlight'] }
    },
    verified: { type: Boolean, default: false }
  },
  stats: {
    views: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    contacts: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },
  seo: {
    slug: { type: String, unique: true, index: true },
    metaTitle: String,
    metaDescription: String
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

// Indexes
ListingSchema.index({ 'location.coordinates': '2dsphere' });
ListingSchema.index({ status: 1, createdAt: -1 });
ListingSchema.index({ category: 1, status: 1 });
ListingSchema.index({ seller: 1, status: 1 });
ListingSchema.index({ 'price.amount': 1 });
ListingSchema.index({ 'features.promoted.isPromoted': 1, createdAt: -1 });
ListingSchema.index({ title: 'text', description: 'text' });

export default mongoose.models.Listing || mongoose.model<IListing>('Listing', ListingSchema);
