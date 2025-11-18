/**
 * NextAuth.js v5 Configuration
 *
 * Centralized auth configuration for reuse across the application
 */

import { type NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { CustomMongoDBAdapter } from './CustomMongoDBAdapter';
import { getClient } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { userService } from '@/lib/services/UserService';
import { adminSessionMaxAgeSeconds } from '@/lib/env';
import { getAuthCache } from '@/lib/auth/RedisAuthCache';
import { CognitoProvider } from './providers/CognitoProvider';
import { logger } from '@/lib/logging/logger';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Feature flag: Use Cognito for auth (set COGNITO_USER_POOL_ID to enable)
const USE_COGNITO = !!process.env.COGNITO_USER_POOL_ID;

export const authOptions: NextAuthConfig = {
  adapter: CustomMongoDBAdapter(getClient()),

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
                logger.info('Authentication attempt started');

                // Validate input
                const { email, password } = loginSchema.parse(credentials);
                const emailDomain = email.split('@')[1];
                logger.info('Login credentials validated', { emailDomain });

                const authCache = getAuthCache();

                // Rate limiting: Check login attempts
                const loginAttempts = await authCache.getLoginAttempts(email);
                const MAX_LOGIN_ATTEMPTS = 5;
                logger.info('Login rate limit check', {
                  attempts: loginAttempts,
                  maxAttempts: MAX_LOGIN_ATTEMPTS,
                  emailDomain,
                });

                if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                  logger.warn('Login rate limit exceeded', {
                    emailDomain,
                    attempts: loginAttempts,
                  });
                  return null; // Don't reveal if user exists
                }

                // Try Redis cache first (fast path)
                // This avoids MongoDB connection if user is cached
                let user:
                  | Awaited<ReturnType<typeof userService.findByEmail>>
                  | null
                  | undefined = await authCache.getUserByEmail(email);

                const cacheStatus = user === undefined ? 'miss' : user === null ? 'negative_hit' : 'hit';
                logger.debug('Cache lookup completed', { cacheStatus, emailDomain });

                // If not in cache (undefined), fall back to MongoDB (with timeout)
                if (user === undefined) {
                  logger.debug('Querying database for user', { emailDomain });
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

                  logger.debug('Database query completed', {
                    userFound: !!user,
                    emailDomain,
                  });
                }

                if (!user) {
                  logger.warn('Authentication failed - user not found', { emailDomain });
                  await authCache.incrementLoginAttempts(email);
                  return null;
                }

                if (!user.password) {
                  logger.warn('Authentication failed - no password set', {
                    emailDomain,
                    userId: user._id.toString(),
                  });
                  await authCache.incrementLoginAttempts(email);
                  return null;
                }

                // Verify password with bcrypt
                logger.debug('Verifying password', { emailDomain });
                const isValid = await bcrypt.compare(password, user.password);

                if (!isValid) {
                  logger.warn('Authentication failed - invalid password', {
                    emailDomain,
                    userId: user._id.toString(),
                  });
                  await authCache.incrementLoginAttempts(email);
                  return null;
                }

                // Success! Reset login attempts
                logger.info('Authentication successful', {
                  userId: user._id.toString(),
                  emailDomain,
                  role: user.role,
                });
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
                logger.error('Authentication error occurred', {
                  error: error instanceof Error ? error.message : 'Unknown error',
                  stack: error instanceof Error ? error.stack : undefined,
                  isTimeout: error instanceof Error && error.message === 'Authentication timeout',
                });
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

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        domain:
          process.env.NODE_ENV === 'production' ? '.engify.ai' : undefined, // Works for both engify.ai and www.engify.ai
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
  },

  callbacks: {
    async signIn() {
      // Allow all sign-ins (we already validated in authorize())
      return true;
    },

    async redirect({ url, baseUrl }) {
      // Normalize URLs to remove www for consistency
      const normalizeUrl = (u: string) => u.replace('://www.', '://');
      const normalizedUrl = normalizeUrl(url);
      const normalizedBaseUrl = normalizeUrl(baseUrl);

      // If url is relative, make it absolute with baseUrl
      if (url.startsWith('/')) {
        const redirectUrl = `${normalizedBaseUrl}${url}`;
        logger.debug('Auth redirect - relative path', { path: url });
        return redirectUrl;
      }

      // If url is on the same origin (after normalization), allow it
      if (normalizedUrl.startsWith(normalizedBaseUrl)) {
        logger.debug('Auth redirect - same origin', { url: normalizedUrl });
        return normalizedUrl;
      }

      // Otherwise redirect to dashboard
      const dashboardUrl = `${normalizedBaseUrl}/dashboard`;
      logger.debug('Auth redirect - default to dashboard');
      return dashboardUrl;
    },

    async jwt({ token, user }: { token: JWT; user: User }) {
      // Add user info to JWT on login
      if (user) {
        logger.debug('JWT token created for user', {
          userId: user.id,
          role: user.role || 'free',
        });
        token.id = user.id;
        token.role = user.role || 'free';
        token.organizationId = user.organizationId;
        token.mfaVerified = (
          user as unknown as { mfaVerified?: boolean }
        ).mfaVerified;
      } else {
        logger.debug('JWT token refreshed', {
          userId: token.id,
          role: token.role,
        });
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      // Add user info to session
      if (session.user) {
        logger.debug('Session created from JWT', {
          userId: token.id,
          role: token.role,
          mfaVerified: token.mfaVerified,
        });
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
