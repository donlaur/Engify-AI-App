import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamic import for server-side Sentry config
    await import('../sentry.server.config' as string);
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Dynamic import for edge Sentry config
    await import('../sentry.edge.config' as string);
  }
}

export const onRequestError = Sentry.captureRequestError;
