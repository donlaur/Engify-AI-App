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
import { getAuthCache } from '@/lib/auth/RedisAuthCache';
import { CognitoProvider } from './providers/CognitoProvider';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Feature flag: Use Cognito for auth (set COGNITO_USER_POOL_ID to enable)
const USE_COGNITO = !!process.env.COGNITO_USER_POOL_ID;

export const authOptions: NextAuthConfig = {
  // TODO: Fix adapter version mismatch - temporarily disabled for build
  // adapter: MongoDBAdapter(clientPromise),

  providers: [
    // Email/Password authentication
    // Use Cognito if configured, otherwise fall back to MongoDB
    ...(USE_COGNITO
      ? [CognitoProvider()]
      : [
          CredentialsProvider({
            name: 'credentials',
            credentials: {
              email: { label: 'Email', type: 'email' },
              password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
              try {
                console.log('🔐 [AUTH] Starting login attempt...');
                
                // Validate input
                const { email, password } = loginSchema.parse(credentials);
                console.log(`🔐 [AUTH] Email validated: ${email}`);

                const authCache = getAuthCache();

                // Rate limiting: Check login attempts
                const loginAttempts = await authCache.getLoginAttempts(email);
                const MAX_LOGIN_ATTEMPTS = 5;
                console.log(`🔐 [AUTH] Login attempts: ${loginAttempts}/${MAX_LOGIN_ATTEMPTS}`);
                
                if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                  console.warn(`🔐 [AUTH] ❌ Too many login attempts for ${email}`);
                  return null; // Don't reveal if user exists
                }

                // Try Redis cache first (fast path)
                // This avoids MongoDB connection if user is cached
                let user:
                  | Awaited<ReturnType<typeof userService.findByEmail>>
                  | null
                  | undefined = await authCache.getUserByEmail(email);
                
                console.log(`🔐 [AUTH] Redis cache result: ${user === undefined ? 'not cached' : user === null ? 'cached as null' : 'cached user found'}`);

                // If not in cache (undefined), fall back to MongoDB (with timeout)
                if (user === undefined) {
                  console.log('🔐 [AUTH] Querying MongoDB...');
                  const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(
                      () => reject(new Error('Authentication timeout')),
                      10000
                    ); // 10 second timeout
                  });

                  // Find user with timeout
                  user = (await Promise.race([
                    userService.findByEmail(email),
                    timeoutPromise,
                  ])) as Awaited<
                    ReturnType<typeof userService.findByEmail>
                  > | null;
                  
                  console.log(`🔐 [AUTH] MongoDB result: ${user ? 'user found' : 'user not found'}`);
                }

                if (!user) {
                  console.log('🔐 [AUTH] ❌ User not found');
                  await authCache.incrementLoginAttempts(email);
                  return null;
                }
                
                if (!user.password) {
                  console.log('🔐 [AUTH] ❌ User has no password set');
                  await authCache.incrementLoginAttempts(email);
                  return null;
                }

                // Verify password with bcrypt
                console.log('🔐 [AUTH] Verifying password...');
                const isValid = await bcrypt.compare(password, user.password);
                console.log(`🔐 [AUTH] Password valid: ${isValid}`);
                
                if (!isValid) {
                  console.log('🔐 [AUTH] ❌ Invalid password');
                  await authCache.incrementLoginAttempts(email);
                  return null;
                }

                // Success! Reset login attempts
                console.log('🔐 [AUTH] ✅ Login successful!');
                await authCache.resetLoginAttempts(email);

                // Return user object
                return {
                  id: user._id.toString(),
                  email: user.email,
                  name: user.name,
                  role: user.role,
                  organizationId: user.organizationId?.toString() || null,
                };
              } catch (error) {
                console.error('🔐 [AUTH] ❌ Auth error:', error);
                // Return more specific error for debugging
                if (
                  error instanceof Error &&
                  error.message === 'Authentication timeout'
                ) {
                  console.error('🔐 [AUTH] ❌ MongoDB connection timeout during login');
                }
                return null;
              }
            },
          }),
        ]),

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
