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

    // Calculate cost based on model
    const cost = this.calculateCost(usage, this.model);

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
   * Calculate cost based on token usage and model
   * Pricing as of October 2024
   * Note: Groq pricing is very competitive
   */
  private calculateCost(
    usage: { promptTokens: number; completionTokens: number },
    model: string
  ) {
    let inputCostPer1M = 0.05; // Default: Llama models
    let outputCostPer1M = 0.1;

    // Adjust pricing based on model
    if (model.includes('llama3-70b')) {
      inputCostPer1M = 0.59;
      outputCostPer1M = 0.79;
    } else if (model.includes('llama3-8b')) {
      inputCostPer1M = 0.05;
      outputCostPer1M = 0.1;
    } else if (model.includes('mixtral')) {
      inputCostPer1M = 0.24;
      outputCostPer1M = 0.24;
    } else if (model.includes('gemma')) {
      inputCostPer1M = 0.1;
      outputCostPer1M = 0.1;
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
