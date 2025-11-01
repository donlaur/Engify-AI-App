/**
 * MongoDB Connection Utility
 *
 * Singleton pattern for MongoDB client
 * Handles connection pooling and reuse
 *
 * Serverless-friendly: Uses global variable to cache connection across invocations
 */

import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local');
}

const uri = process.env.MONGODB_URI;
// Detect if using mongodb+srv:// (which auto-handles TLS)
const isSrvUri = uri.startsWith('mongodb+srv://');

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
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

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

/**
 * Get MongoDB client
 */
export async function getClient(): Promise<MongoClient> {
  return clientPromise;
}

/**
 * Get MongoDB database
 */
export async function getDb(dbName: string = 'engify'): Promise<Db> {
  const client = await getClient();
  return client.db(dbName);
}
