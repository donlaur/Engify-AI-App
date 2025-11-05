/**
 * AI Summary: Executes Groq chat completions with shared timeout/retry guardrails.
 */

import Groq from 'groq-sdk';
import { AIProvider, AIRequest, AIResponse } from '../interfaces/AIProvider';
import { executeWithProviderHarness } from '../utils/provider-harness';
export class GroqAdapter implements AIProvider {
  readonly name = 'Groq';
  readonly provider = 'groq';

  private client: Groq;
  private model: string;

  /**
   * Create a new Groq adapter
   * @param model - The Groq model to use (default: llama3-8b-8192)
   */
  constructor(model: string = 'llama3-8b-8192') {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY || 'test-key',
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
   * Execute an AI request using Groq
   */
  async execute(request: AIRequest): Promise<AIResponse> {
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

    // Call Groq API
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
