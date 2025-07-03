import mongoose from 'mongoose';
import { env } from '../lib/env';

interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
  dbName: string;
}

export const databaseConfig: DatabaseConfig = {
  uri: env.MONGODB_URI,
  dbName: env.MONGODB_DB_NAME,
  options: {
    // Connection settings
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
    
    // Buffering settings
    bufferCommands: false, // Disable mongoose buffering
    
    // Write concern
    w: 'majority',
    wtimeoutMS: 5000,
    
    // Read preference
    readPreference: 'primary',
    
    // Retry settings
    retryWrites: true,
    retryReads: true,
    
    // Compression
    compressors: ['zlib'],
    
    // Connection naming
    appName: 'OLX-Marketplace'
  }
};

// Index configurations for models
export const indexConfigurations = {
  users: [
    { email: 1 },
    { 'location.coordinates': '2dsphere' },
    { email: 1, status: 1 },
    { role: 1 },
    { createdAt: -1 },
    { 'oauth.google.id': 1, sparse: true },
    { 'oauth.facebook.id': 1, sparse: true },
    { phone: 1, sparse: true, unique: true }
  ],
  listings: [
    { seller: 1, status: 1 },
    { status: 1, createdAt: -1 },
    { category: 1, status: 1 },
    { 'location.coordinates': '2dsphere' },
    { 'location.city': 1 },
    { 'price.amount': 1 },
    { 'features.promoted.isPromoted': 1, createdAt: -1 },
    { 'seo.slug': 1, unique: true },
    { title: 'text', description: 'text' },
    { expiresAt: 1 }
  ],
  categories: [
    { slug: 1, unique: true },
    { parent: 1, sortOrder: 1 },
    { isActive: 1, level: 1 }
  ],
  conversations: [
    { participants: 1 },
    { listing: 1 },
    { updatedAt: -1 }
  ],
  messages: [
    { conversation: 1, createdAt: -1 },
    { sender: 1 }
  ],
  payments: [
    { user: 1, createdAt: -1 },
    { status: 1 },
    { 'provider.transactionId': 1, unique: true }
  ],
  subscriptions: [
    { user: 1, unique: true },
    { status: 1, 'billing.currentPeriodEnd': 1 }
  ],
  reports: [
    { status: 1, priority: 1, createdAt: -1 },
    { 'target.type': 1, 'target.id': 1 },
    { reporter: 1 }
  ],
  notifications: [
    { recipient: 1, 'status.read': 1, createdAt: -1 },
    { type: 1 },
    { expiresAt: 1 }
  ]
};

// Database connection events
export const setupDatabaseEvents = () => {
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
  });

  mongoose.connection.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('📴 MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    } catch (error) {
      console.error('Error during MongoDB shutdown:', error);
      process.exit(1);
    }
  });
};

// Database health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    if (!mongoose.connection.db) {
      console.error('Database connection is not established.');
      return false;
    }
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();
    return result.ok === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Database statistics
export const getDatabaseStats = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database connection is not established.');
      return null;
    }
    const stats = await db.stats();
    
    return {
      dbName: stats.db,
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      objects: stats.objects
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return null;
  }
};