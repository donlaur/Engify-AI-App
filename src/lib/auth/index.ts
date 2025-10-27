/**
 * NextAuth Helpers Export
 *
 * Exports auth, signIn, signOut for use throughout the app
 * Cannot be exported from route.ts due to Next.js restrictions
 */

import NextAuth from 'next-auth';
import { authOptions } from './config';

export const { auth, signIn, signOut } = NextAuth(authOptions);
