/**
 * MongoDB Client
 * Singleton connection to MongoDB with connection pooling
 *
 * MVP MODE: Returns null if MONGODB_URI not set (uses static data instead)
 */

import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    'MONGODB_URI is required. Please add it to your .env.local file.\n' +
      'Get a free MongoDB Atlas cluster at: https://cloud.mongodb.com'
  );
}

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
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

export default clientPromise;
