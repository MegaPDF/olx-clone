// MongoDB connection
import mongoose from 'mongoose';
import { env } from './env';

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

export async function connectDB(): Promise<typeof mongoose> {
  // Check if already connected
  if (connection.isConnected) {
    console.log('Already connected to MongoDB');
    return mongoose;
  }

  try {
    // Connect to MongoDB
    const db = await mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME
    });

    connection.isConnected = db.connections[0].readyState;

    console.log('MongoDB connected successfully');

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      console.log('Mongoose connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
    });

    return db;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (connection.isConnected) {
    await mongoose.disconnect();
    connection.isConnected = 0;
    console.log('MongoDB disconnected');
  }
}

// For serverless environments
if (process.env.NODE_ENV === 'development') {
  // In development, preserve the connection across hot reloads
  const globalWithMongo = global as typeof globalThis & {
    _mongooseConnect?: Promise<typeof mongoose>;
  };

  if (!globalWithMongo._mongooseConnect) {
    globalWithMongo._mongooseConnect = connectDB();
  }
}