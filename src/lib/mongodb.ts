/**
 * MongoDB Connection Utility (CANONICAL)
 *
 * This is the SINGLE SOURCE OF TRUTH for MongoDB connections.
 * All other MongoDB connection files should import from here.
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
// Detect if using SRV connection string format (which auto-handles TLS)
// Security: URI is loaded from environment variable, not hardcoded
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
 * @param dbName - Database name (defaults to 'engify')
 */
export async function getDb(dbName: string = 'engify'): Promise<Db> {
  const client = await getClient();
  return client.db(dbName);
}

/**
 * Get MongoDB client (alias for getClient)
 */
export async function getMongoClient(): Promise<MongoClient> {
  return getClient();
}

/**
 * Get MongoDB database instance (alias for getDb with 'engify' database)
 */
export async function getMongoDb(): Promise<Db> {
  return getDb('engify');
}

/**
 * Connect to MongoDB database (alias for getDb with 'engify' database)
 * @deprecated Use getDb() instead for consistency
 */
export async function connectDB(): Promise<Db> {
  return getDb('engify');
}
