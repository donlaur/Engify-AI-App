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
  maxPoolSize: 1, // FREE TIER: Limit to 1 connection per serverless function
  minPoolSize: 0, // FREE TIER: Don't maintain minimum connections
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  w: 'majority' as const,
  maxIdleTimeMS: 60000, // FREE TIER: Keep connections alive longer
  family: 4, // Force IPv4 to avoid DNS issues
  // SSL/TLS options for MongoDB Atlas
  // Note: mongodb+srv:// automatically handles TLS, but explicit options help with some environments
  ...(isSrvUri
    ? {
        // For SRV connections, MongoDB handles TLS automatically
        // But we can add explicit TLS options for better compatibility
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
      }
    : {
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
      }),
  // Connection pool options
  heartbeatFrequencyMS: 10000,
  // Additional options for serverless environments
  directConnection: false, // Use replica set connection
};

// Use global variable to cache connection across invocations (important for serverless)
const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoClient?: MongoClient;
};

/**
 * Create MongoDB client with retry logic
 */
async function createClientWithRetry(): Promise<MongoClient> {
  let retries = 3;
  let lastError: Error | null = null;

  while (retries > 0) {
    try {
      const client = new MongoClient(uri, options);

      // Attempt connection with timeout
      await Promise.race([
        client.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        ),
      ]);

      // Verify connection works
      await client.db('admin').command({ ping: 1 });

      return client;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retries--;

      if (retries > 0) {
        // Exponential backoff: wait 1s, 2s, 4s
        const delay = Math.pow(2, 3 - retries) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Failed to create MongoDB client');
}

const clientPromise: Promise<MongoClient> =
  globalWithMongo._mongoClientPromise ||
  (() => {
    const promise = createClientWithRetry();
    globalWithMongo._mongoClientPromise = promise;

    // Store client reference for cleanup
    promise.then((client) => {
      globalWithMongo._mongoClient = client;
    });

    return promise;
  })();

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

/**
 * Get MongoDB client with health check
 */
export async function getClient(): Promise<MongoClient> {
  try {
    const client = await clientPromise;

    // Quick health check
    try {
      await client.db('admin').command({ ping: 1 }, { maxTimeMS: 5000 });
    } catch (pingError) {
      // Connection might be stale, try to reconnect
      console.warn('MongoDB ping failed, attempting reconnect...');
      delete globalWithMongo._mongoClientPromise;
      delete globalWithMongo._mongoClient;

      const newClient = await createClientWithRetry();
      globalWithMongo._mongoClientPromise = Promise.resolve(newClient);
      globalWithMongo._mongoClient = newClient;

      return newClient;
    }

    return client;
  } catch (error) {
    console.error('Failed to get MongoDB client:', error);
    throw error;
  }
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
