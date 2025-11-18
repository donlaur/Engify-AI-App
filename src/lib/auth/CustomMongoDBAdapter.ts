/**
 * Custom MongoDB Adapter for NextAuth
 *
 * Extends the default MongoDBAdapter to include custom user fields:
 * - role
 * - organizationId
 *
 * These fields are defined via module augmentation in src/types/next-auth.d.ts
 */

import { MongoDBAdapter } from '@auth/mongodb-adapter';
import type { Adapter, AdapterUser } from 'next-auth/adapters';
import type { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';

/**
 * Create a custom MongoDB adapter that includes our custom user fields
 */
export function CustomMongoDBAdapter(client: MongoClient | Promise<MongoClient>): Adapter {
  const baseAdapter = MongoDBAdapter(client);

  return {
    ...baseAdapter,

    async createUser(user) {
      // Call the base adapter's createUser
      const createdUser = await baseAdapter.createUser!(user);

      // Extract custom fields from the input user
      const userWithCustomFields = user as any;
      const role = userWithCustomFields.role || 'user';
      const organizationId = userWithCustomFields.organizationId || null;

      // Update the user in the database to include custom fields
      const mongoClient = await Promise.resolve(client);
      const db = mongoClient.db();
      await db.collection('users').updateOne(
        { _id: new ObjectId(createdUser.id) },
        {
          $set: {
            role,
            organizationId,
          },
        }
      );

      // Return the user with custom fields
      return {
        ...createdUser,
        role,
        organizationId,
      } as AdapterUser;
    },

    async getUser(id) {
      const user = await baseAdapter.getUser!(id);
      if (!user) return null;

      // The user from the database already has the custom fields
      // Just return it with proper typing
      return user as AdapterUser;
    },

    async getUserByEmail(email) {
      const user = await baseAdapter.getUserByEmail!(email);
      if (!user) return null;

      // The user from the database already has the custom fields
      // Just return it with proper typing
      return user as AdapterUser;
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const user = await baseAdapter.getUserByAccount!({ providerAccountId, provider });
      if (!user) return null;

      // The user from the database already has the custom fields
      // Just return it with proper typing
      return user as AdapterUser;
    },
  } as Adapter;
}
