import { AIProvider, AIRequest, AIResponse } from '../interfaces/AIProvider';

/**
 * ReplicateAdapter
 *
 * Minimal scaffold to integrate Replicate via our standardized provider interface.
 * This adapter focuses on text-generation style use-cases first; image workflows
 * will use a separate utility entry point to avoid overloading the AIProvider interface.
 */
export class ReplicateAdapter implements AIProvider {
  readonly name = 'Replicate';
  readonly provider = 'replicate';

  constructor(private readonly model: string) {}

  validateRequest(request: AIRequest): boolean {
    return (
      typeof request.prompt === 'string' && request.prompt.trim().length > 0
    );
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();

    if (!this.validateRequest(request)) {
      throw new Error('Invalid request: prompt is required');
    }
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not set');
    }

    // NOTE: Full Replicate integration typically uses model versions and the SDK.
    // Here we provide a safe, minimal scaffold that can be expanded to call
    // replicate.run(model, { input }) when the chosen models are finalized.

    // For now, return a deterministic stub to keep contracts intact.
    const latency = Date.now() - start;
    return {
      content: `Replicate(${this.model}) placeholder: ${request.prompt}`,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      cost: { input: 0, output: 0, total: 0 },
      latency,
      provider: this.provider,
      model: this.model,
    };
  }
}
