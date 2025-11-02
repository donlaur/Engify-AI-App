/**
 * User Router
 *
 * tRPC router for user-related operations
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { userService } from '@/lib/services/UserService';
import { skillTrackingService } from '@/lib/services/SkillTrackingService';

export const userRouter = createTRPCRouter({
  /**
   * Get current user's profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await userService.getUserById(ctx.session.user.id);
    if (!user) {
      throw new Error('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
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
      const user = await userService.updateUser(ctx.session.user.id, input);
      if (!user) {
        throw new Error('Failed to update user');
      }
      return { success: true };
    }),

  /**
   * Get user's learning progress
   */
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const skills = await skillTrackingService.getUserSkills(
      ctx.session.user.id
    );
    return skills;
  }),
});
