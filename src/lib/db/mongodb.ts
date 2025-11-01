/**
 * MongoDB Client
 * Singleton connection to MongoDB with connection pooling
 *
 * SERVER-SIDE ONLY - Do not import in client components
 *
 * Serverless-friendly: Uses global variable to cache connection across invocations
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

// Detect if using mongodb+srv:// (which auto-handles TLS)
const isSrvUri = uri.startsWith('mongodb+srv://');

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
  // SSL/TLS options for MongoDB Atlas
  // Note: mongodb+srv:// automatically handles TLS, but explicit options help with some environments
  ...(isSrvUri
    ? {}
    : {
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
      }),
  // Connection pool options
  heartbeatFrequencyMS: 10000,
};

// Use global variable to cache connection across invocations (important for serverless)
const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const clientPromise: Promise<MongoClient> =
  globalWithMongo._mongoClientPromise ||
  (() => {
    const client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
    return globalWithMongo._mongoClientPromise;
  })();

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
