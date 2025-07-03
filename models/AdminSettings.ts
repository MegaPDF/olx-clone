// Admin settings model
import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminSettings extends Document {
  _id: string;
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    contactEmail: string;
    supportEmail: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
  };
  aws: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region: string;
    bucketName: string;
    cloudFrontUrl?: string;
  };
  stripe: {
    publicKey?: string;
    secretKey?: string;
    webhookSecret?: string;
    currency: string;
  };
  oauth: {
    google: {
      clientId?: string;
      clientSecret?: string;
      enabled: boolean;
    };
    facebook: {
      appId?: string;
      appSecret?: string;
      enabled: boolean;
    };
  };
  email: {
    provider: 'smtp' | 'sendgrid' | 'ses';
    smtp?: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      password: string;
    };
    sendgrid?: {
      apiKey: string;
    };
    ses?: {
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
    fromEmail: string;
    fromName: string;
  };
  pricing: {
    promotion: {
      featured: { price: number; duration: number };
      urgent: { price: number; duration: number };
      highlight: { price: number; duration: number };
    };
    subscription: {
      basic: {
        monthly: number;
        yearly: number;
        features: {
          maxListings: number;
          maxImages: number;
          promotedListings: number;
        };
      };
      premium: {
        monthly: number;
        yearly: number;
        features: {
          maxListings: number;
          maxImages: number;
          promotedListings: number;
        };
      };
    };
  };
  limits: {
    freeUser: {
      maxListings: number;
      maxImages: number;
      listingDuration: number;
    };
    imageUpload: {
      maxSize: number;
      allowedTypes: string[];
      maxDimensions: { width: number; height: number };
    };
  };
  features: {
    chat: boolean;
    favorites: boolean;
    reports: boolean;
    promotions: boolean;
    subscriptions: boolean;
    geolocation: boolean;
    notifications: boolean;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
    ogImage: string;
  };
  analytics: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    enabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AdminSettingsSchema = new Schema<IAdminSettings>({
  general: {
    siteName: { type: String, default: 'OLX Marketplace' },
    siteDescription: { type: String, default: 'Buy and sell locally' },
    siteUrl: { type: String, required: true },
    contactEmail: { type: String, required: true },
    supportEmail: { type: String, required: true },
    maintenanceMode: { type: Boolean, default: false },
    registrationEnabled: { type: Boolean, default: true }
  },
  aws: {
    accessKeyId: String,
    secretAccessKey: String,
    region: { type: String, default: 'us-east-1' },
    bucketName: String,
    cloudFrontUrl: String
  },
  stripe: {
    publicKey: String,
    secretKey: String,
    webhookSecret: String,
    currency: { type: String, default: 'USD', enum: ['USD', 'IDR'] }
  },
  oauth: {
    google: {
      clientId: String,
      clientSecret: String,
      enabled: { type: Boolean, default: false }
    },
    facebook: {
      appId: String,
      appSecret: String,
      enabled: { type: Boolean, default: false }
    }
  },
  email: {
    provider: { type: String, enum: ['smtp', 'sendgrid', 'ses'], default: 'smtp' },
    smtp: {
      host: String,
      port: Number,
      secure: Boolean,
      user: String,
      password: String
    },
    sendgrid: {
      apiKey: String
    },
    ses: {
      region: String,
      accessKeyId: String,
      secretAccessKey: String
    },
    fromEmail: String,
    fromName: { type: String, default: 'OLX Marketplace' }
  },
  pricing: {
    promotion: {
      featured: { price: { type: Number, default: 5 }, duration: { type: Number, default: 7 } },
      urgent: { price: { type: Number, default: 3 }, duration: { type: Number, default: 3 } },
      highlight: { price: { type: Number, default: 2 }, duration: { type: Number, default: 7 } }
    },
    subscription: {
      basic: {
        monthly: { type: Number, default: 9.99 },
        yearly: { type: Number, default: 99.99 },
        features: {
          maxListings: { type: Number, default: 50 },
          maxImages: { type: Number, default: 10 },
          promotedListings: { type: Number, default: 5 }
        }
      },
      premium: {
        monthly: { type: Number, default: 19.99 },
        yearly: { type: Number, default: 199.99 },
        features: {
          maxListings: { type: Number, default: 200 },
          maxImages: { type: Number, default: 20 },
          promotedListings: { type: Number, default: 20 }
        }
      }
    }
  },
  limits: {
    freeUser: {
      maxListings: { type: Number, default: 5 },
      maxImages: { type: Number, default: 5 },
      listingDuration: { type: Number, default: 30 }
    },
    imageUpload: {
      maxSize: { type: Number, default: 5242880 }, // 5MB
      allowedTypes: { type: [String], default: ['image/jpeg', 'image/png', 'image/webp'] },
      maxDimensions: {
        width: { type: Number, default: 2048 },
        height: { type: Number, default: 2048 }
      }
    }
  },
  features: {
    chat: { type: Boolean, default: true },
    favorites: { type: Boolean, default: true },
    reports: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
    subscriptions: { type: Boolean, default: true },
    geolocation: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true }
  },
  seo: {
    defaultTitle: { type: String, default: 'OLX Marketplace - Buy and Sell Locally' },
    defaultDescription: { type: String, default: 'Find great deals on new and used items in your area' },
    keywords: { type: [String], default: ['marketplace', 'buy', 'sell', 'classified'] },
    ogImage: String
  },
  analytics: {
    googleAnalyticsId: String,
    facebookPixelId: String,
    enabled: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

export default mongoose.models.AdminSettings || mongoose.model<IAdminSettings>('AdminSettings', AdminSettingsSchema);