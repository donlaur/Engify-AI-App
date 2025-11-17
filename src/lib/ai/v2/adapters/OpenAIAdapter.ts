/**
 * AI Summary: Standardizes OpenAI chat completions with shared timeout/retry guardrails.
 */

import OpenAI from 'openai';
import { AIProvider, AIRequest, AIResponse } from '../interfaces/AIProvider';
import { executeWithProviderHarness } from '../utils/provider-harness';
export class OpenAIAdapter implements AIProvider {
  readonly name = 'OpenAI';
  readonly provider = 'openai';

  private client: OpenAI;
  private model: string;

  /**
   * Create a new OpenAI adapter
   * @param model - The OpenAI model to use (default: gpt-4o-mini)
   */
  constructor(model: string = 'gpt-4o-mini') {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'test-key',
    });
    this.model = model;
  }

  /**
   * Validate the request before execution
   */
  validateRequest(request: AIRequest): boolean {
    // Check prompt exists and is not empty
    if (!request.prompt || request.prompt.trim().length === 0) {
      return false;
    }

    // Check max tokens is within bounds
    if (request.maxTokens && request.maxTokens > 4096) {
      return false;
    }

    // Check temperature is within bounds
    if (
      request.temperature !== undefined &&
      (request.temperature < 0 || request.temperature > 2)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Execute an AI request using OpenAI
   */
  async execute(request: AIRequest): Promise<AIResponse> {
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

    // Call OpenAI API
    const { value: response, latencyMs } = await executeWithProviderHarness(
      () =>
        this.client.chat.completions.create({
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

    // Extract usage data
    const usage = {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    };

    // Calculate cost from database
    const cost = await this.calculateCost(usage, this.model);

    return {
      content: response.choices[0]?.message?.content || '',
      usage,
      cost,
      latency: latencyMs,
      provider: this.provider,
      model: this.model,
    };
  }

  /**
   * Calculate cost based on token usage using database pricing
   */
  private async calculateCost(
    usage: { promptTokens: number; completionTokens: number },
    model: string
  ) {
    const { calculateCostFromDB } = await import('@/lib/ai/utils/model-cost');
    return await calculateCostFromDB(model, usage.promptTokens, usage.completionTokens);
  }
}
