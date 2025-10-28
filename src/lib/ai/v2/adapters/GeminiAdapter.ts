import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIRequest, AIResponse } from '../interfaces/AIProvider';

/**
 * Gemini Adapter
 *
 * Implements the AIProvider interface for Google's Gemini API.
 * Wraps the Google Generative AI SDK and provides standardized request/response format.
 */
export class GeminiAdapter implements AIProvider {
  readonly name = 'Gemini';
  readonly provider = 'google';

  private client: GoogleGenerativeAI;
  private model: string;

  /**
   * Create a new Gemini adapter
   * @param model - The Gemini model to use (default: gemini-pro)
   */
  constructor(model: string = 'gemini-pro') {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is required');
    }
    this.client = new GoogleGenerativeAI(apiKey);
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

    // Check temperature is within bounds (Gemini uses 0-1)
    if (
      request.temperature !== undefined &&
      (request.temperature < 0 || request.temperature > 1)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Execute an AI request using Gemini
   */
  async execute(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    // Get the model
    const model = this.client.getGenerativeModel({ model: this.model });

    // Build the prompt (Gemini doesn't have separate system prompt in the same way)
    let fullPrompt = request.prompt;
    if (request.systemPrompt) {
      fullPrompt = `${request.systemPrompt}\n\n${request.prompt}`;
    }

    // Call Gemini API
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 2000,
      },
    });

    const latency = Date.now() - startTime;

    // Extract response
    const response = result.response;
    const text = response.text();

    // Gemini doesn't always provide token counts, so we estimate
    const promptTokens = this.estimateTokens(fullPrompt);
    const completionTokens = this.estimateTokens(text);

    const usage = {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };

    // Calculate cost based on model
    const cost = this.calculateCost(usage, this.model);

    return {
      content: text,
      usage,
      cost,
      latency,
      provider: this.provider,
      model: this.model,
    };
  }

  /**
   * Estimate token count (rough approximation: 1 token ≈ 4 characters)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate cost based on token usage and model
   * Pricing as of October 2024
   */
  private calculateCost(
    usage: { promptTokens: number; completionTokens: number },
    model: string
  ) {
    let inputCostPer1M = 0.125; // Default: Gemini Pro
    let outputCostPer1M = 0.375;

    // Adjust pricing based on model
    if (model.includes('ultra')) {
      inputCostPer1M = 0.5;
      outputCostPer1M = 1.5;
    } else if (model.includes('pro')) {
      inputCostPer1M = 0.125;
      outputCostPer1M = 0.375;
    } else if (model.includes('flash')) {
      inputCostPer1M = 0.075;
      outputCostPer1M = 0.3;
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
