/**
 * AI Summary: Executes Anthropic Claude messages with shared timeout/retry guardrails.
 */

import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, AIRequest, AIResponse } from '../interfaces/AIProvider';
import { executeWithProviderHarness } from '../utils/provider-harness';
import { loggingProvider } from '@/lib/providers/LoggingProvider';

export class ClaudeAdapter implements AIProvider {
  readonly name = 'Claude';
  readonly provider = 'anthropic';

  private client: Anthropic | null = null;
  private model: string;

  /**
   * Create a new Claude adapter
   * @param model - The Claude model to use (default: claude-3-haiku-20240307)
   */
  constructor(model: string = 'claude-3-haiku-20240307') {
    this.model = model;
  }

  /**
   * Lazy initialization of Anthropic client
   * Only creates client when actually needed (not during module load)
   */
  private getClient(): Anthropic {
    if (!this.client) {
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
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
      loggingProvider.warn('Claude validation failed: empty prompt', {
        provider: this.provider,
        model: this.model,
        reason: 'empty_prompt',
      });
      return false;
    }

    // Check temperature is within bounds
    if (
      request.temperature !== undefined &&
      (request.temperature < 0 || request.temperature > 1)
    ) {
      loggingProvider.warn('Claude validation failed: temperature out of bounds', {
        provider: this.provider,
        model: this.model,
        temperature: request.temperature,
        bounds: [0, 1],
        reason: 'temperature_out_of_bounds',
      });
      return false;
    }

    return true;
  }

  /**
   * Execute an AI request using Claude
   */
  async execute(request: AIRequest): Promise<AIResponse> {
    try {
      // Get client (lazy initialization)
      const client = this.getClient();

      // Call Anthropic API
      const { value: response, latencyMs } = await executeWithProviderHarness(
        () =>
          client.messages.create({
            model: this.model,
            max_tokens: request.maxTokens ?? 2000,
            temperature: request.temperature ?? 0.7,
            system: request.systemPrompt,
            messages: [
              {
                role: 'user',
                content: request.prompt,
              },
            ],
          }),
        {
          provider: this.provider,
          model: this.model,
          operation: 'chat-completion',
        }
      );

      // Validate response
      if (!response.content || response.content.length === 0) {
        const error = new Error('Claude API returned empty response');
        loggingProvider.error('Claude execution failed: empty response', error, {
          provider: this.provider,
          model: this.model,
          latency: latencyMs,
        });
        throw error;
      }

      // Extract content
      const content = response.content[0];
      const text = content.type === 'text' ? content.text : '';

      // Extract usage data
      const usage = {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      };

      // Calculate cost from database with error handling
      const cost = await this.calculateCost(usage, this.model);

      return {
        content: text,
        usage,
        cost,
        latency: latencyMs,
        provider: this.provider,
        model: this.model,
      };
    } catch (error) {
      loggingProvider.error('Claude execution failed', error, {
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
      const { calculateCostFromDB } = await import('@/lib/ai/utils/model-cost');
      return await calculateCostFromDB(model, usage.promptTokens, usage.completionTokens);
    } catch (error) {
      loggingProvider.error('Failed to calculate cost for Claude request', error, {
        provider: this.provider,
        model,
        usage,
      });
      // Return zero cost on error to allow execution to continue
      return { input: 0, output: 0, total: 0 };
    }
  }
}
