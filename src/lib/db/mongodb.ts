/**
 * MongoDB Client
 * Singleton connection to MongoDB with connection pooling
 *
 * SERVER-SIDE ONLY - Do not import in client components
 */

import { MongoClient, Db } from 'mongodb';

// Ensure this only runs on server
if (typeof window !== 'undefined') {
  throw new Error('mongodb.ts should only be imported in server-side code');
}

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 30000, // Increased for DNS issues
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000, // Increased for DNS issues
  retryWrites: true,
  retryReads: true,
  w: 'majority' as const,
  maxIdleTimeMS: 30000,
  family: 4, // Force IPv4 to avoid DNS issues
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve the connection
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Get MongoDB database instance
 */
export async function getMongoDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db('engify');
}

/**
 * Get MongoDB client
 */
export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

// Alias for backward compatibility
export const connectDB = getMongoDb;

export default clientPromise;
