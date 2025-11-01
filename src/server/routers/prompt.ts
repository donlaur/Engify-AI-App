/**
 * Prompt Router
 *
 * tRPC router for prompt-related operations
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { promptService } from '@/lib/services/PromptService';
import { favoriteService } from '@/lib/services/FavoriteService';

export const promptRouter = createTRPCRouter({
  /**
   * Get all public prompts
   * Supports filtering by category, role, and search
   */
  getAll: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        role: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(), // For pagination
      })
    )
    .query(async ({ input }) => {
      let prompts;

      // Handle filtering
      if (input.search) {
        prompts = await promptService.searchPrompts(input.search);
      } else if (input.category) {
        prompts = await promptService.getPromptsByCategory(input.category);
      } else {
        prompts = await promptService.getPublicPrompts();
      }

      // Apply limit
      const limitedPrompts = prompts.slice(0, input.limit);

      return {
        prompts: limitedPrompts,
        nextCursor: null,
      };
    }),

  /**
   * Get a single prompt by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const prompt = await promptService.getPromptById(input.id);
      return prompt;
    }),

  /**
   * Get user's favorite prompts
   */
  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    const favorites = await favoriteService.getUserFavorites(
      ctx.session.user.id,
      'prompt'
    );
    return favorites;
  }),

  /**
   * Add prompt to favorites
   */
  addFavorite: protectedProcedure
    .input(z.object({ promptId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await favoriteService.addFavorite(
        ctx.session.user.id,
        'prompt',
        input.promptId
      );
      return { success: true };
    }),

  /**
   * Remove prompt from favorites
   */
  removeFavorite: protectedProcedure
    .input(z.object({ promptId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await favoriteService.removeFavorite(
        ctx.session.user.id,
        'prompt',
        input.promptId
      );
      return { success: true };
    }),

  /**
   * Rate a prompt
   */
  rate: protectedProcedure
    .input(
      z.object({
        promptId: z.string(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await promptService.updateRating(input.promptId, input.rating);
      return { success: true };
    }),
});
