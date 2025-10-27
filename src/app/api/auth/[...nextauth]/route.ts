/**
 * NextAuth.js v5 Route Handler
 *
 * Handles authentication requests
 * Configuration is in /src/lib/auth/config.ts
 *
 * Note: Only GET and POST can be exported from route files
 * Auth helpers are exported from /src/lib/auth/index.ts
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const { handlers } = NextAuth(authOptions);

// Export handlers for Next.js App Router
export const { GET, POST } = handlers;
