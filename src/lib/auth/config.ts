/**
 * NextAuth.js v5 Configuration
 *
 * Centralized auth configuration for reuse across the application
 */

import { type NextAuthConfig } from 'next-auth';
// import { MongoDBAdapter } from '@auth/mongodb-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
// import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { Session, User } from 'next-auth';
import { userService } from '@/lib/services/UserService';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authOptions: NextAuthConfig = {
  // TODO: Fix adapter version mismatch - temporarily disabled for build
  // adapter: MongoDBAdapter(clientPromise),

  providers: [
    // Email/Password authentication
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate input
          const { email, password } = loginSchema.parse(credentials);

          // Find user
          const user = await userService.findByEmail(email);
          if (!user || !user.password) {
            return null;
          }

          // Verify password
          // TODO: Re-enable bcrypt when auth is fully configured
          const isValid = password === user.password; // Temporary - NOT SECURE!
          if (!isValid) {
            return null;
          }

          // Return user object
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId?.toString() || null,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),

    // Google OAuth (optional - can enable later)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],

  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/login',
  },

  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User }) {
      // Add user info to token on login
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      // Add user info to session
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.organizationId = token.organizationId;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
