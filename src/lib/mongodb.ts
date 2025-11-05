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
 *
 * IMPORTANT: This file is SERVER-ONLY and must never be imported in client components.
 * Use 'use server' directive or ensure this is only imported in Server Components/API routes.
 *
 * This module is excluded from client bundles via next.config.js webpack externals.
 */

import { MongoClient, Db } from 'mongodb';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables (for scripts and serverless environments)
// Check multiple locations: current dir, parent dir (for worktrees), common git worktree locations
if (typeof process !== 'undefined') {
  const currentDir = process.cwd();
  const parentDir = resolve(currentDir, '..');
  const fs = require('fs');
  
  // Try current directory first
  config({ path: resolve(currentDir, '.env.local') });
  config({ path: resolve(currentDir, '.env') });
  
  // If not found, try parent directory (for git worktrees)
  if (!process.env.MONGODB_URI) {
    config({ path: resolve(parentDir, '.env.local') });
    config({ path: resolve(parentDir, '.env') });
  }
  
  // If still not found and we're in a worktree, try common worktree patterns
  if (!process.env.MONGODB_URI && currentDir.includes('worktrees')) {
    // Try going up to find git common dir or main repo
    const worktreeRoot = currentDir.split('/worktrees/')[0];
    if (worktreeRoot) {
      // Try worktree root's parent (common git worktree location)
      const possibleMainRepo = resolve(worktreeRoot, '..');
      const envPaths = [
        resolve(possibleMainRepo, '.env.local'),
        resolve(worktreeRoot, '.env.local'),
        // Also try absolute path to main repo (common worktree scenario)
        resolve('/Users/donlaur/dev/Engify-AI-App', '.env.local'),
      ];
      
      for (const envPath of envPaths) {
        if (fs.existsSync(envPath)) {
          config({ path: envPath });
          if (process.env.MONGODB_URI) break;
        }
      }
    } else {
      // Fallback: try common absolute paths
      const commonPaths = [
        resolve('/Users/donlaur/dev/Engify-AI-App', '.env.local'),
        resolve('/Users/donlaur/dev/Engify-AI-App', '.env'),
      ];
      
      for (const envPath of commonPaths) {
        if (fs.existsSync(envPath)) {
          config({ path: envPath });
          if (process.env.MONGODB_URI) break;
        }
      }
    }
  }
}

/**
 * Get MongoDB URI (lazy check - only when needed)
 */
function getMongoUri(): string {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MONGODB_URI to .env.local');
  }
  return process.env.MONGODB_URI;
}

/**
 * Get MongoDB connection options
 */
function getMongoOptions() {
  const uri = getMongoUri();
  const isSrvUri = uri.startsWith('mongodb+srv://');

  return {
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
    ...(isSrvUri
      ? {
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
}

// Use global variable to cache connection across invocations (important for serverless)
const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoClient?: MongoClient;
};

/**
 * Create MongoDB client with retry logic
 */
async function createClientWithRetry(): Promise<MongoClient> {
  const uri = getMongoUri();
  const options = getMongoOptions();
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

// Lazy initialization - only create client promise when actually needed
let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (!clientPromise) {
    clientPromise = createClientWithRetry();
    globalWithMongo._mongoClientPromise = clientPromise;

    // Store client reference for cleanup
    clientPromise.then((client) => {
      globalWithMongo._mongoClient = client;
    });
  }
  return clientPromise;
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
// Note: This is lazy - only created when getClient() is called
// We export the function instead of calling it immediately to avoid module load errors
export default getClientPromise;

/**
 * Get MongoDB client with health check
 */
export async function getClient(): Promise<MongoClient> {
  try {
    const client = await getClientPromise();

    // Quick health check
    try {
      await client.db('admin').command({ ping: 1 }, { maxTimeMS: 5000 });
    } catch (pingError) {
      // Connection might be stale, try to reconnect
      console.warn('MongoDB ping failed, attempting reconnect...');
      delete globalWithMongo._mongoClientPromise;
      delete globalWithMongo._mongoClient;
      clientPromise = null; // Reset so it recreates

      clientPromise = createClientWithRetry();
      globalWithMongo._mongoClientPromise = clientPromise;
      globalWithMongo._mongoClient = await clientPromise;

      return await clientPromise;
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
