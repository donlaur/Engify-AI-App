/**
 * AI Summary: Provides shared timeout, retry, and logging guardrails for AI provider calls.
 */

import { setTimeout as delay } from 'node:timers/promises';
import { logger } from '@/lib/logging/logger';

export interface ProviderHarnessOptions {
  provider: string;
  model: string;
  operation?: string;
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

interface HarnessResult<T> {
  value: T;
  latencyMs: number;
  attempts: number;
}

const DEFAULT_TIMEOUT_MS = Number(
  process.env.AI_PROVIDER_TIMEOUT_MS ?? '45000'
);
const DEFAULT_MAX_RETRIES = Number(process.env.AI_PROVIDER_MAX_RETRIES ?? '1');
const DEFAULT_RETRY_DELAY_MS = Number(
  process.env.AI_PROVIDER_RETRY_DELAY_MS ?? '300'
);

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  if (timeoutMs <= 0) {
    return promise;
  }

  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export async function executeWithProviderHarness<T>(
  task: () => Promise<T>,
  options: ProviderHarnessOptions
): Promise<HarnessResult<T>> {
  const {
    provider,
    model,
    operation = 'text-generation',
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  } = options;

  const start = Date.now();
  let attempts = 0;
  let lastError: unknown;

  while (attempts <= maxRetries) {
    attempts += 1;
    try {
      if (attempts > 1) {
        logger.warn('ai.provider.retry', {
          provider,
          model,
          operation,
          attempt: attempts,
          maxRetries,
        });
      }

      const value = await withTimeout(
        task(),
        timeoutMs,
        `${provider}:${model}:${operation}`
      );

      const latencyMs = Date.now() - start;
      logger.info('ai.provider.success', {
        provider,
        model,
        operation,
        attempts,
        latencyMs,
      });

      return { value, latencyMs, attempts };
    } catch (error) {
      lastError = error;

      if (attempts > maxRetries) {
        const latencyMs = Date.now() - start;
        logger.error('ai.provider.failed', {
          provider,
          model,
          operation,
          attempts,
          latencyMs,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }

      const backoff = retryDelayMs * attempts;
      await delay(backoff);
    }
  }

  const latencyMs = Date.now() - start;
  logger.error('ai.provider.failed', {
    provider,
    model,
    operation,
    attempts,
    latencyMs,
    error: lastError instanceof Error ? lastError.message : String(lastError),
  });
  throw lastError instanceof Error
    ? lastError
    : new Error(
        `Provider ${provider}:${model} failed after ${attempts} attempts`
      );
}
