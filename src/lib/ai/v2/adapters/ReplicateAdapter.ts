/**
 * AI Summary: Enforces model allowlists, retries, and cost tracking for Replicate LLM calls.
 */

import { AIProvider, AIRequest, AIResponse } from '../interfaces/AIProvider';
import { logger } from '@/lib/logging/logger';
import { executeWithProviderHarness } from '../utils/provider-harness';

const DEFAULT_ALLOWED_MODELS = [
  'google/gemini-2.5-flash', // Updated with correct prefix
  'google/gemini-2.0-flash-exp',
  'meta/llama-3.1-405b-instruct',
  'openai/gpt-5',
  'anthropic/claude-4.5-haiku',
  'anthropic/claude-4.5-sonnet', // Added for product/engineering reviews
];

const MAX_RETRIES = Number(process.env.REPLICATE_MAX_RETRIES ?? '2');
const RETRY_BACKOFF_MS = Number(process.env.REPLICATE_RETRY_DELAY_MS ?? '500');
const TIMEOUT_MS = Number(process.env.REPLICATE_TIMEOUT_MS ?? '45000');

const MODEL_COSTS_USD_PER_1M_TOKENS: Record<
  string,
  { input: number; output: number }
> = {
  'google/gemini-2.5-flash': { input: 2.50, output: 2.50 }, // $2.50 per million tokens (confirmed from Replicate pricing)
  'google/gemini-2.0-flash-exp': { input: 0.075, output: 0.3 },
  'meta/llama-3.1-405b-instruct': { input: 0.59, output: 0.79 },
  'openai/gpt-5': { input: 0.0025, output: 0.01 }, // Estimated based on GPT-4o pricing
  'anthropic/claude-4.5-haiku': { input: 0.00025, output: 0.00125 },
  'anthropic/claude-4.5-sonnet': { input: 0.003, output: 0.015 }, // Estimated - more capable than Haiku
};

function parseAllowedModels(): Set<string> | null {
  const configured = (process.env.REPLICATE_ALLOWED_MODELS ?? '')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);
  
  // If REPLICATE_ALLOW_ALL=true, allow any model (DB registry will enforce allowlist)
  if (process.env.REPLICATE_ALLOW_ALL === 'true') {
    return null; // null means allow all (registry-controlled)
  }
  
  return new Set(configured.length > 0 ? configured : DEFAULT_ALLOWED_MODELS);
}

function ensureModelAllowed(modelId: string): string {
  const allowed = parseAllowedModels();
  
  // If allowlist is null or REPLICATE_ALLOW_ALL=true, allow all models
  if (allowed === null || process.env.REPLICATE_ALLOW_ALL === 'true') {
    return modelId;
  }
  
  // Check if model is in allowlist
  if (!allowed.has(modelId)) {
    const message = `Replicate model "${modelId}" is not in allowlist. Add REPLICATE_ALLOW_ALL=true to .env.local to allow all models, or add it to REPLICATE_ALLOWED_MODELS`;
    logger.warn('replicate.model_blocked', { model: modelId });
    throw new Error(message);
  }
  return modelId;
}

function estimateTokens(text: string): number {
  const clean = text?.trim() ?? '';
  if (clean.length === 0) return 0;
  return Math.ceil(clean.length / 4); // rough heuristic
}

function estimateCost(
  modelId: string,
  promptTokens: number,
  completionTokens: number
) {
  const pricing = MODEL_COSTS_USD_PER_1M_TOKENS[modelId] ?? {
    input: 0,
    output: 0,
  };
  const input = (promptTokens / 1_000_000) * pricing.input;
  const output = (completionTokens / 1_000_000) * pricing.output;
  return {
    input,
    output,
    total: input + output,
  };
}

export class ReplicateAdapter implements AIProvider {
  readonly name = 'Replicate';
  readonly provider = 'replicate';

  constructor(private readonly model: string) {}

  validateRequest(request: AIRequest): boolean {
    return (
      typeof request.prompt === 'string' && request.prompt.trim().length > 0
    );
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();

    if (!this.validateRequest(request)) {
      throw new Error('Invalid request: prompt is required');
    }
    const token = process.env.REPLICATE_API_TOKEN;
    const requestedModel = process.env.REPLICATE_MODEL || this.model;
    const modelId = ensureModelAllowed(requestedModel);

    if (token && modelId) {
      try {
        const Replicate = (await import('replicate')).default;
        const replicate = new Replicate({ auth: token });
        const input: Record<string, unknown> = { prompt: request.prompt };
        if (typeof request.maxTokens === 'number') {
          input.max_tokens = request.maxTokens;
        }
        if (typeof request.temperature === 'number') {
          input.temperature = request.temperature;
        }

        const { value: rawOutput, latencyMs } =
          await executeWithProviderHarness(
            () => replicate.run(modelId as `${string}/${string}`, { input }) as Promise<unknown>,
            {
              provider: this.provider,
              model: modelId,
              operation: 'text-generation',
              timeoutMs: TIMEOUT_MS,
              maxRetries: MAX_RETRIES,
              retryDelayMs: RETRY_BACKOFF_MS,
            }
          );

        const content = Array.isArray(rawOutput)
          ? String(rawOutput[0] ?? '')
          : typeof rawOutput === 'string'
            ? rawOutput
            : JSON.stringify(rawOutput);

        const promptTokens = estimateTokens(request.prompt);
        const completionTokens = estimateTokens(content);
        const usage = {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        };
        const cost = estimateCost(modelId, promptTokens, completionTokens);

        logger.info('replicate.request.success', {
          model: modelId,
          latency: latencyMs,
          usage,
          cost,
        });

        return {
          content,
          usage,
          cost,
          latency: latencyMs,
          provider: this.provider,
          model: modelId,
        };
      } catch (err) {
        const latency = Date.now() - start;
        logger.error('replicate.request.failed', {
          model: modelId,
          error: err instanceof Error ? err.message : String(err),
        });
        return {
          content: `Replicate(${modelId}) error fallback: ${String(err)}`,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          cost: { input: 0, output: 0, total: 0 },
          latency,
          provider: this.provider,
          model: modelId,
        };
      }
    }

    // Fallback scaffold if token/model not set
    const latency = Date.now() - start;
    return {
      content: `Replicate(${this.model}) placeholder: ${request.prompt}`,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      cost: { input: 0, output: 0, total: 0 },
      latency,
      provider: this.provider,
      model: this.model,
    };
  }
}
