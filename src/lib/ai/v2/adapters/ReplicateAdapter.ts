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
    const token = process.env.REPLICATE_API_TOKEN;
    const modelId = process.env.REPLICATE_MODEL || this.model;

    if (token && modelId) {
      try {
        const Replicate = (await import('replicate')).default;
        const replicate = new Replicate({ auth: token });
        const input: Record<string, unknown> = { prompt: request.prompt };
        if (typeof request.maxTokens === 'number')
          input.max_tokens = request.maxTokens;
        if (typeof request.temperature === 'number')
          input.temperature = request.temperature;

        const output = (await replicate.run(modelId, { input })) as unknown;
        const content = Array.isArray(output)
          ? String(output[0] ?? '')
          : typeof output === 'string'
            ? output
            : JSON.stringify(output);

        const latency = Date.now() - start;
        return {
          content,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          cost: { input: 0, output: 0, total: 0 },
          latency,
          provider: this.provider,
          model: modelId,
        };
      } catch (err) {
        const latency = Date.now() - start;
        return {
          content: `Replicate(${modelId}) error fallback: ${String(err)}`,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          cost: { input: 0, output: 0, total: 0 },
          latency,
          provider: this.provider,
          model: modelId,
        };
      }
    }

    // Fallback scaffold if token/model not set
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
