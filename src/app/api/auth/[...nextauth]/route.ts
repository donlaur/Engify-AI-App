/**
 * NextAuth.js v5 Route Handler
 *
 * Handles authentication requests
 * Configuration is in /src/lib/auth/config.ts
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

// Export handlers for Next.js App Router
export const { GET, POST } = handlers;

// Export auth helpers for use in other files
export { auth, signIn, signOut };
