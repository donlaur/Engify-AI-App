/**
 * Custom MongoDB Adapter for NextAuth
 *
 * Extends the default MongoDBAdapter to include custom user fields:
 * - role
 * - organizationId
 *
 * This fixes the type error where AdapterUser doesn't include our custom fields.
 */

import { MongoDBAdapter } from '@auth/mongodb-adapter';
import type { Adapter, AdapterUser } from 'next-auth/adapters';
import type { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';

/**
 * Extended AdapterUser with our custom fields
 * Use intersection type to override role as optional
 */
export type ExtendedAdapterUser = Omit<AdapterUser, 'role'> & {
  role?: string;
  organizationId?: string | null;
};

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

      // Add our custom fields if they exist in the input
      const extendedUser: ExtendedAdapterUser = {
        ...createdUser,
        role: (user as ExtendedAdapterUser).role || 'user',
        organizationId: (user as ExtendedAdapterUser).organizationId || null,
      };

      // Update the user in the database to include custom fields
      const mongoClient = await Promise.resolve(client);
      const db = mongoClient.db();
      await db.collection('users').updateOne(
        { _id: new ObjectId(createdUser.id) },
        {
          $set: {
            role: extendedUser.role,
            organizationId: extendedUser.organizationId,
          },
        }
      );

      return extendedUser as AdapterUser;
    },

    async getUser(id) {
      const user = await baseAdapter.getUser!(id);
      if (!user) return null;

      // Include custom fields in the returned user
      return {
        ...user,
        role: (user as ExtendedAdapterUser).role,
        organizationId: (user as ExtendedAdapterUser).organizationId,
      } as AdapterUser;
    },

    async getUserByEmail(email) {
      const user = await baseAdapter.getUserByEmail!(email);
      if (!user) return null;

      // Include custom fields in the returned user
      return {
        ...user,
        role: (user as ExtendedAdapterUser).role,
        organizationId: (user as ExtendedAdapterUser).organizationId,
      } as AdapterUser;
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const user = await baseAdapter.getUserByAccount!({ providerAccountId, provider });
      if (!user) return null;

      // Include custom fields in the returned user
      return {
        ...user,
        role: (user as ExtendedAdapterUser).role,
        organizationId: (user as ExtendedAdapterUser).organizationId,
      } as AdapterUser;
    },
  };
}
