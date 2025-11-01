/**
 * NextAuth.js v5 Configuration
 *
 * Centralized auth configuration for reuse across the application
 */

import { type NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { userService } from '@/lib/services/UserService';
import { adminSessionMaxAgeSeconds } from '@/lib/env';

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

          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(
              () => reject(new Error('Authentication timeout')),
              10000
            ); // 10 second timeout
          });

          // Find user with timeout
          const user = (await Promise.race([
            userService.findByEmail(email),
            timeoutPromise,
          ])) as Awaited<ReturnType<typeof userService.findByEmail>>;

          if (!user || !user.password) {
            return null;
          }

          // Verify password with bcrypt
          const isValid = await bcrypt.compare(password, user.password);
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
          // Return more specific error for debugging
          if (
            error instanceof Error &&
            error.message === 'Authentication timeout'
          ) {
            console.error('MongoDB connection timeout during login');
          }
          return null;
        }
      },
    }),

    // Google OAuth (optional - can enable later)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),

    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ],

  session: {
    strategy: 'jwt' as const,
    maxAge: adminSessionMaxAgeSeconds,
    updateAge: Math.min(adminSessionMaxAgeSeconds / 2, 15 * 60),
  },

  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User }) {
      // Add user info to token on login
      if (user) {
        token.id = user.id;
        token.role = user.role || 'free';
        token.organizationId = user.organizationId;
        token.mfaVerified = (
          user as unknown as { mfaVerified?: boolean }
        ).mfaVerified;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      // Add user info to session
      if (session.user) {
        Object.assign(session.user, {
          id: token.id,
          role: token.role,
          organizationId: token.organizationId,
          mfaVerified: Boolean(token.mfaVerified),
        });
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
