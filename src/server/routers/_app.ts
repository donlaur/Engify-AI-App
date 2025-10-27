/**
 * Main tRPC Router
 * 
 * This is the primary router that combines all sub-routers.
 * Add new routers here as you build features.
 */

import { createTRPCRouter } from '../trpc';
import { promptRouter } from './prompt';
import { userRouter } from './user';

export const appRouter = createTRPCRouter({
  prompt: promptRouter,
  user: userRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
