/**
 * HeaderClient Component
 * 
 * Client-side wrapper for Header that provides session data
 * This allows Header to work in both SSG and client-side contexts
 */

'use client';

import { useSession } from 'next-auth/react';
import { Header } from './Header';

export function HeaderClient() {
  const { data: session } = useSession();
  
  return <Header user={session?.user || null} />;
}

