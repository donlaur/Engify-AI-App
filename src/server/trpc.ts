/**
 * tRPC Server Configuration
 * 
 * This is the core tRPC setup that provides:
 * - Type-safe API routes
 * - Automatic type inference
 * - Input validation with Zod
 * - Middleware support
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getServerSession } from 'next-auth';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Create context for tRPC requests
 * This runs for every request and provides:
 * - User session
 * - Request headers
 * - Any other per-request data
 */
export async function createTRPCContext(opts: CreateNextContextOptions) {
  const session = await getServerSession(authOptions);

  return {
    session,
    req: opts.req,
    res: opts.res,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC with superjson for Date/Map/Set serialization
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 * 
 * Usage:
 * ```ts
 * export const myRouter = createTRPCRouter({
 *   getProfile: protectedProcedure.query(async ({ ctx }) => {
 *     // ctx.session.user is guaranteed to exist
 *     return getUserProfile(ctx.session.user.id);
 *   }),
 * });
 * ```
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // TODO: Check if user has admin role
  // const user = await getUserById(ctx.session.user.id);
  // if (user.role !== 'admin' && user.role !== 'owner') {
  //   throw new TRPCError({ code: 'FORBIDDEN' });
  // }

  return next({ ctx });
});
