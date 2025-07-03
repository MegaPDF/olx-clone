// Category model
import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  _id: string;
  name: {
    en: string;
    id: string;
  };
  slug: string;
  description?: {
    en?: string;
    id?: string;
  };
  icon?: string;
  image?: string;
  parent?: mongoose.Types.ObjectId;
  level: number;
  isActive: boolean;
  sortOrder: number;
  listingCount: number;
  seo: {
    title?: {
      en?: string;
      id?: string;
    };
    description?: {
      en?: string;
      id?: string;
    };
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: {
    en: { type: String, required: true },
    id: { type: String, required: true }
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    en: String,
    id: String
  },
  icon: String,
  image: String,
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  listingCount: {
    type: Number,
    default: 0
  },
  seo: {
    title: {
      en: String,
      id: String
    },
    description: {
      en: String,
      id: String
    },
    keywords: [String]
  }
}, {
  timestamps: true
});

// Indexes
CategorySchema.index({ parent: 1, sortOrder: 1 });
CategorySchema.index({ isActive: 1, level: 1 });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
