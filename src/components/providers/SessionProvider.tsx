/**
 * Session Provider Wrapper
 * 
 * Client component that wraps NextAuth SessionProvider
 * This allows server components to have access to session via useSession()
 */

'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function SessionProvider({ children }: { children: ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}

