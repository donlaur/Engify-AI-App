/**
 * User Router
 * 
 * tRPC router for user-related operations
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  /**
   * Get current user's profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Implement with MongoDB service
    // ctx.session.user is available
    return {
      id: ctx.session.user.id,
      email: ctx.session.user.email,
      name: ctx.session.user.name,
    };
  }),

  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        image: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement with MongoDB service
      return { success: true };
    }),

  /**
   * Get user's learning progress
   */
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Implement with MongoDB service
    return [];
  }),
});
