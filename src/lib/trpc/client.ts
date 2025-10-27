/**
 * tRPC Client Configuration
 * 
 * This sets up the tRPC client for use in React components
 */

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();
