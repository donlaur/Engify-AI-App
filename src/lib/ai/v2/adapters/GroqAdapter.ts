/**
 * AI Summary: Executes Groq chat completions with shared timeout/retry guardrails.
 */

import Groq from 'groq-sdk';
import { AIProvider, AIRequest, AIResponse } from '../interfaces/AIProvider';
import { executeWithProviderHarness } from '../utils/provider-harness';
import { loggingProvider } from '@/lib/providers/LoggingProvider';

export class GroqAdapter implements AIProvider {
  readonly name = 'Groq';
  readonly provider = 'groq';

  private client: Groq | null = null;
  private model: string;

  /**
   * Create a new Groq adapter
   * @param model - The Groq model to use (default: llama3-8b-8192)
   */
  constructor(model: string = 'llama3-8b-8192') {
    this.model = model;
  }

  /**
   * Lazy initialization of Groq client
   * Only creates client when actually needed (not during module load)
   */
  private getClient(): Groq {
    if (!this.client) {
      this.client = new Groq({
        apiKey: process.env.GROQ_API_KEY || 'test-key',
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
      loggingProvider.warn('Groq validation failed: empty prompt', {
        provider: this.provider,
        model: this.model,
        reason: 'empty_prompt',
      });
      return false;
    }

    // Check temperature is within bounds
    if (
      request.temperature !== undefined &&
      (request.temperature < 0 || request.temperature > 2)
    ) {
      loggingProvider.warn('Groq validation failed: temperature out of bounds', {
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
   * Execute an AI request using Groq
   */
  async execute(request: AIRequest): Promise<AIResponse> {
    try {
      // Build messages array
      const messages: Groq.Chat.ChatCompletionMessageParam[] = [];

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

      // Call Groq API
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
        const error = new Error('Groq API returned empty response');
        loggingProvider.error('Groq execution failed: empty response', error, {
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
      loggingProvider.error('Groq execution failed', error, {
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
      loggingProvider.error('Failed to calculate cost for Groq request', error, {
        provider: this.provider,
        model,
        usage,
      });
      // Return zero cost on error to allow execution to continue
      return { input: 0, output: 0, total: 0 };
    }
  }
}
