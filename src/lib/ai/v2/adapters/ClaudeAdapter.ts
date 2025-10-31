/**
 * AI Summary: Executes Anthropic Claude messages with shared timeout/retry guardrails.
 */

import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, AIRequest, AIResponse } from '../interfaces/AIProvider';
import { executeWithProviderHarness } from '../utils/provider-harness';
export class ClaudeAdapter implements AIProvider {
  readonly name = 'Claude';
  readonly provider = 'anthropic';

  private client: Anthropic;
  private model: string;

  /**
   * Create a new Claude adapter
   * @param model - The Claude model to use (default: claude-3-haiku-20240307)
   */
  constructor(model: string = 'claude-3-haiku-20240307') {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
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
      (request.temperature < 0 || request.temperature > 1)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Execute an AI request using Claude
   */
  async execute(request: AIRequest): Promise<AIResponse> {
    // Call Anthropic API
    const { value: response, latencyMs } = await executeWithProviderHarness(
      () =>
        this.client.messages.create({
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

    // Extract content
    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';

    // Extract usage data
    const usage = {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    };

    // Calculate cost based on model
    const cost = this.calculateCost(usage, this.model);

    return {
      content: text,
      usage,
      cost,
      latency: latencyMs,
      provider: this.provider,
      model: this.model,
    };
  }

  /**
   * Calculate cost based on token usage and model
   * Pricing as of October 2024
   */
  private calculateCost(
    usage: { promptTokens: number; completionTokens: number },
    model: string
  ) {
    let inputCostPer1M = 0.25; // Default: Haiku
    let outputCostPer1M = 1.25;

    // Adjust pricing based on model
    if (model.includes('opus')) {
      inputCostPer1M = 15.0;
      outputCostPer1M = 75.0;
    } else if (model.includes('sonnet')) {
      inputCostPer1M = 3.0;
      outputCostPer1M = 15.0;
    } else if (model.includes('haiku')) {
      inputCostPer1M = 0.25;
      outputCostPer1M = 1.25;
    }

    const input = (usage.promptTokens / 1000000) * inputCostPer1M;
    const output = (usage.completionTokens / 1000000) * outputCostPer1M;

    return {
      input,
      output,
      total: input + output,
    };
  }
}
