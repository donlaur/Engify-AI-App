/**
 * AI Summary: Wraps Google Gemini completions with shared timeout/retry guardrails.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIRequest, AIResponse } from '../interfaces/AIProvider';
import { executeWithProviderHarness } from '../utils/provider-harness';
import { loggingProvider } from '@/lib/providers/LoggingProvider';

export class GeminiAdapter implements AIProvider {
  readonly name = 'Gemini';
  readonly provider = 'google';

  private client: GoogleGenerativeAI | null = null;
  private model: string;

  /**
   * Create a new Gemini adapter
   * @param model - The Gemini model to use (default: gemini-2.0-flash-exp)
   *
   * ⚠️ VERIFIED OCT 31, 2025: Gemini 1.5 models are SUNSET!
   * Working models as of today:
   * - gemini-2.0-flash-exp (FREE, experimental, verified working)
   * - gemini-exp-1206 (FREE, experimental, verified working)
   *
   * To update: Run scripts/content/list-gemini-models.ts monthly
   */
  constructor(model: string = 'gemini-2.0-flash-exp') {
    this.model = model;
  }

  /**
   * Lazy initialization of Google Generative AI client
   * Only creates client when actually needed (not during module load)
   */
  private getClient(): GoogleGenerativeAI {
    if (!this.client) {
      const apiKey =
        process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY || 'test-key';
      this.client = new GoogleGenerativeAI(apiKey);
    }
    return this.client;
  }

  /**
   * Validate the request before execution
   */
  validateRequest(request: AIRequest): boolean {
    // Check prompt exists and is not empty
    if (!request.prompt || request.prompt.trim().length === 0) {
      loggingProvider.warn('Gemini validation failed: empty prompt', {
        provider: this.provider,
        model: this.model,
        reason: 'empty_prompt',
      });
      return false;
    }

    // Check temperature is within bounds (Gemini uses 0-1)
    if (
      request.temperature !== undefined &&
      (request.temperature < 0 || request.temperature > 1)
    ) {
      loggingProvider.warn('Gemini validation failed: temperature out of bounds', {
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
   * Execute an AI request using Gemini
   */
  async execute(request: AIRequest): Promise<AIResponse> {
    try {
      // Get client (lazy initialization)
      const client = this.getClient();

      // Get the model
      const model = client.getGenerativeModel({ model: this.model });

      // Build the prompt (Gemini doesn't have separate system prompt in the same way)
      let fullPrompt = request.prompt;
      if (request.systemPrompt) {
        fullPrompt = `${request.systemPrompt}\n\n${request.prompt}`;
      }

      // Call Gemini API
      const { value: result, latencyMs } = await executeWithProviderHarness(
        () =>
          model.generateContent({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: request.temperature ?? 0.7,
              maxOutputTokens: request.maxTokens ?? 2000,
            },
          }),
        {
          provider: this.provider,
          model: this.model,
          operation: 'chat-completion',
        }
      );

      // Validate response
      if (!result.response) {
        const error = new Error('Gemini API returned empty response');
        loggingProvider.error('Gemini execution failed: empty response', error, {
          provider: this.provider,
          model: this.model,
          latency: latencyMs,
        });
        throw error;
      }

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
      loggingProvider.error('Gemini execution failed', error, {
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
   * Estimate token count (rough approximation: 1 token ≈ 4 characters)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
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
      loggingProvider.error('Failed to calculate cost for Gemini request', error, {
        provider: this.provider,
        model,
        usage,
      });
      // Return zero cost on error to allow execution to continue
      return { input: 0, output: 0, total: 0 };
    }
  }
}
