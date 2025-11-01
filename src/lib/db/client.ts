/**
 * MongoDB Client
 *
 * Singleton connection to MongoDB with connection pooling
 *
 * Serverless-friendly: Uses global variable to cache connection across invocations
 */

import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

const uri = process.env.MONGODB_URI;
// Detect if using mongodb+srv:// (which auto-handles TLS)
const isSrvUri = uri.startsWith('mongodb+srv://');

const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  // SSL/TLS options for MongoDB Atlas
  // Note: mongodb+srv:// automatically handles TLS, but explicit options help with some environments
  ...(isSrvUri
    ? {}
    : {
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
      }),
  // Connection timeouts
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  // Retry configuration
  retryWrites: true,
  retryReads: true,
  // Connection pool
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
 * Get MongoDB client
 */
export async function getClient(): Promise<MongoClient> {
  return clientPromise;
}

/**
 * Get MongoDB database
 */
export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db();
}

/**
 * Close MongoDB connection
 * Only use in tests or shutdown
 */
export async function closeConnection(): Promise<void> {
  const client = await getClient();
  await client.close();
}

export default clientPromise;
