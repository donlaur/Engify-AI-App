/**
 * AI Summary: Standardizes OpenAI chat completions with shared timeout/retry guardrails.
 */

import OpenAI from 'openai';
import { AIProvider, AIRequest, AIResponse } from '../interfaces/AIProvider';
import { executeWithProviderHarness } from '../utils/provider-harness';
import { loggingProvider } from '@/lib/providers/LoggingProvider';

export class OpenAIAdapter implements AIProvider {
  readonly name = 'OpenAI';
  readonly provider = 'openai';

  private client: OpenAI | null = null;
  private model: string;

  /**
   * Create a new OpenAI adapter
   * @param model - The OpenAI model to use (default: gpt-4o-mini)
   */
  constructor(model: string = 'gpt-4o-mini') {
    this.model = model;
  }

  /**
   * Lazy initialization of OpenAI client
   * Only creates client when actually needed (not during module load)
   */
  private getClient(): OpenAI {
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || 'test-key',
      });
    }
    return this.client;
  }

  /**
   * Validate the request before execution
   */
  validateRequest(request: AIRequest): boolean {
    // Check prompt exists and is not empty
    if (!request.prompt || request.prompt.trim().length === 0) {
      loggingProvider.warn('OpenAI validation failed: empty prompt', {
        provider: this.provider,
        model: this.model,
        reason: 'empty_prompt',
      });
      return false;
    }

    // Check max tokens is within bounds
    if (request.maxTokens && request.maxTokens > 4096) {
      loggingProvider.warn('OpenAI validation failed: maxTokens exceeds limit', {
        provider: this.provider,
        model: this.model,
        maxTokens: request.maxTokens,
        limit: 4096,
        reason: 'max_tokens_exceeded',
      });
      return false;
    }

    // Check temperature is within bounds
    if (
      request.temperature !== undefined &&
      (request.temperature < 0 || request.temperature > 2)
    ) {
      loggingProvider.warn('OpenAI validation failed: temperature out of bounds', {
        provider: this.provider,
        model: this.model,
        temperature: request.temperature,
        bounds: [0, 2],
        reason: 'temperature_out_of_bounds',
      });
      return false;
    }

    return true;
  }

  /**
   * Execute an AI request using OpenAI
   */
  async execute(request: AIRequest): Promise<AIResponse> {
    try {
      // Build messages array
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

      if (request.systemPrompt) {
        messages.push({
          role: 'system',
          content: request.systemPrompt,
        });
      }

      messages.push({
        role: 'user',
        content: request.prompt,
      });

      // Get client (lazy initialization)
      const client = this.getClient();

      // Call OpenAI API
      const { value: response, latencyMs } = await executeWithProviderHarness(
        () =>
          client.chat.completions.create({
            model: this.model,
            messages,
            temperature: request.temperature ?? 0.7,
            max_tokens: request.maxTokens ?? 2000,
          }),
        {
          provider: this.provider,
          model: this.model,
          operation: 'chat-completion',
        }
      );

      // Validate response
      if (!response.choices || response.choices.length === 0) {
        const error = new Error('OpenAI API returned empty response');
        loggingProvider.error('OpenAI execution failed: empty response', error, {
          provider: this.provider,
          model: this.model,
          latency: latencyMs,
        });
        throw error;
      }

      // Extract usage data
      const usage = {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      };

      // Calculate cost from database with error handling
      const cost = await this.calculateCost(usage, this.model);

      return {
        content: response.choices[0]?.message?.content || '',
        usage,
        cost,
        latency: latencyMs,
        provider: this.provider,
        model: this.model,
      };
    } catch (error) {
      loggingProvider.error('OpenAI execution failed', error, {
        provider: this.provider,
        model: this.model,
        promptLength: request.prompt?.length || 0,
        temperature: request.temperature,
        maxTokens: request.maxTokens,
      });
      throw error;
    }
  }

  /**
   * Calculate cost based on token usage using database pricing
   */
  private async calculateCost(
    usage: { promptTokens: number; completionTokens: number },
    model: string
  ) {
    try {
      const { calculateCostFromDB } = await import('@/lib/ai/utils/model-cost' as string);
      return await calculateCostFromDB(model, usage.promptTokens, usage.completionTokens);
    } catch (error) {
      loggingProvider.error('Failed to calculate cost for OpenAI request', error, {
        provider: this.provider,
        model,
        usage,
      });
      // Return zero cost on error to allow execution to continue
      return { input: 0, output: 0, total: 0 };
    }
  }
}
