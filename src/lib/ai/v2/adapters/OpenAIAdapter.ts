import OpenAI from 'openai';
import { AIProvider, AIRequest, AIResponse } from '../interfaces/AIProvider';

/**
 * OpenAI Adapter
 *
 * Implements the AIProvider interface for OpenAI's API.
 * Wraps the OpenAI SDK and provides standardized request/response format.
 */
export class OpenAIAdapter implements AIProvider {
  readonly name = 'OpenAI';
  readonly provider = 'openai';

  private client: OpenAI;
  private model: string;

  /**
   * Create a new OpenAI adapter
   * @param model - The OpenAI model to use (default: gpt-3.5-turbo)
   */
  constructor(model: string = 'gpt-3.5-turbo') {
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
    const startTime = Date.now();

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
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2000,
    });

    const latency = Date.now() - startTime;

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
      latency,
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
    let inputCostPer1M = 0.5; // Default: GPT-3.5-turbo
    let outputCostPer1M = 1.5;

    // Adjust pricing based on model
    if (model.includes('gpt-4')) {
      inputCostPer1M = 30.0;
      outputCostPer1M = 60.0;
    } else if (model.includes('gpt-3.5')) {
      inputCostPer1M = 0.5;
      outputCostPer1M = 1.5;
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
