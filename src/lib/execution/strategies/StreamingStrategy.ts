import {
  IStreamingStrategy,
  ExecutionContext,
  ExecutionResult,
  AIRequest,
  StrategyConfig,
} from '../interfaces/IExecutionStrategy';
import { AIProviderFactory } from '@/lib/ai/v2/factory/AIProviderFactory';

/**
 * Streaming execution strategy for real-time AI responses
 */
export class StreamingStrategy implements IStreamingStrategy {
  public readonly name = 'streaming';
  public readonly config: StrategyConfig;

  constructor(
    private _factory: AIProviderFactory,
    config?: Partial<StrategyConfig>
  ) {
    this.config = {
      name: 'streaming',
      enabled: true,
      priority: 3,
      conditions: {
        maxTokens: 4000, // Streaming works best with smaller requests
      },
      ...config,
    };
  }

  /**
   * Execute AI request with streaming support
   */
  async execute(
    request: AIRequest,
    _context: ExecutionContext,
    provider: string
  ): Promise<ExecutionResult> {
    const aiProvider = AIProviderFactory.create(provider);
    if (!aiProvider) {
      throw new Error(`Provider not found: ${provider}`);
    }

    const startTime = Date.now();
    let fullResponse = '';
    let tokenCount = 0;

    // For non-streaming execution, we'll simulate streaming by processing in chunks
    const response = await aiProvider.execute({
      ...request,
      stream: true,
    });

    // Process the response as if it were streamed
    const chunks = this.chunkResponse(response.content);

    for (const chunk of chunks) {
      fullResponse += chunk;
      tokenCount += this.estimateTokens(chunk);

      // Simulate streaming delay
      await this.delay(50);
    }

    return {
      response: {
        ...response,
        content: fullResponse,
        usage: {
          ...response.usage,
          completionTokens: tokenCount,
          totalTokens: response.usage.promptTokens + tokenCount,
        },
      },
      strategy: this.name,
      executionTime: Date.now() - startTime,
      streamed: true,
    };
  }

  /**
   * Execute with actual streaming support
   */
  async executeStream(
    request: AIRequest,
    _context: ExecutionContext,
    provider: string,
    onChunk: (chunk: string) => void,
    onComplete: (result: ExecutionResult) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const aiProvider = AIProviderFactory.create(provider);
      if (!aiProvider) {
        throw new Error(`Provider not found: ${provider}`);
      }

      const startTime = Date.now();
      let fullResponse = '';
      let tokenCount = 0;

      // Execute with streaming
      const response = await aiProvider.execute({
        ...request,
        stream: true,
      });

      // Process streaming response
      const chunks = this.chunkResponse(response.content);

      for (const chunk of chunks) {
        fullResponse += chunk;
        tokenCount += this.estimateTokens(chunk);

        // Send chunk to client
        onChunk(chunk);

        // Simulate streaming delay
        await this.delay(50);
      }

      // Complete execution
      const result: ExecutionResult = {
        response: {
          ...response,
          content: fullResponse,
          usage: {
            ...response.usage,
            completionTokens: tokenCount,
            totalTokens: response.usage.promptTokens + tokenCount,
          },
        },
        strategy: this.name,
        executionTime: Date.now() - startTime,
        streamed: true,
      };

      onComplete(result);
    } catch (error) {
      onError(
        error instanceof Error ? error : new Error('Streaming execution failed')
      );
    }
  }

  /**
   * Check if this strategy can handle the request
   */
  canHandle(request: AIRequest, _context: ExecutionContext): boolean {
    if (!this.config.enabled) return false;

    // Check token limits
    if (
      this.config.conditions?.maxTokens &&
      (request.maxTokens || 0) > this.config.conditions.maxTokens
    ) {
      return false;
    }

    // Check user tier
    // No user-tier restriction in test/standard environments

    // Streaming can handle any priority when enabled and conditions are met
    // Preferred for high/urgent, but can handle normal/low if enabled
    return true;
  }

  /**
   * Get strategy priority
   */
  getPriority(request: AIRequest, context: ExecutionContext): number {
    let priority = this.config.priority;

    // Boost priority for urgent/high requests, reduce for normal/low
    if (context.priority === 'urgent') priority += 2;
    else if (context.priority === 'high') priority += 1;
    else if (context.priority === 'normal' || context.priority === 'low')
      priority -= 2;

    // Boost for smaller requests (better for streaming)
    if ((request.maxTokens || 0) < 2000) priority += 1;

    return priority;
  }

  /**
   * Validate request
   */
  validateRequest(request: AIRequest, context: ExecutionContext): boolean {
    return !!(
      request.prompt &&
      request.prompt.length > 0 &&
      context.userId &&
      context.requestId
    );
  }

  /**
   * Get estimated execution time
   */
  getEstimatedTime(request: AIRequest, context: ExecutionContext): number {
    const baseTime = 2000; // 2 seconds base
    const tokenTime = (request.maxTokens || 1000) * 0.05; // 50ms per token
    const priorityMultiplier = context.priority === 'urgent' ? 0.8 : 1.0;

    return Math.round((baseTime + tokenTime) * priorityMultiplier);
  }

  /**
   * Split response into chunks for streaming simulation
   */
  private chunkResponse(content: string): string[] {
    const words = content.split(' ');
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += 3) {
      chunks.push(words.slice(i, i + 3).join(' ') + ' ');
    }

    return chunks;
  }

  /**
   * Estimate token count for text
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4); // Rough estimation
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
