/**
 * AIProvider Interface
 *
 * Common interface that all AI providers must implement.
 * This enables the Strategy pattern - providers are interchangeable.
 *
 * SOLID Principles:
 * - Single Responsibility: Each provider handles one AI service
 * - Open/Closed: Add new providers without modifying existing code
 * - Liskov Substitution: All providers can be used interchangeably
 * - Interface Segregation: Clean, focused interface
 * - Dependency Inversion: Depend on abstraction, not concrete implementations
 */

export interface AIProvider {
  /** Human-readable name (e.g., "OpenAI", "Claude") */
  readonly name: string;

  /** Provider identifier (e.g., "openai", "anthropic") */
  readonly provider: string;

  /**
   * Execute an AI request
   * @param request - The AI request to execute
   * @returns Promise with AI response including usage and cost data
   */
  execute(request: AIRequest): Promise<AIResponse>;

  /**
   * Validate a request before execution
   * @param request - The request to validate
   * @returns true if valid, false otherwise
   */
  validateRequest(request: AIRequest): boolean;
}

/**
 * Standard request format for all AI providers
 */
export interface AIRequest {
  /** The user's prompt */
  prompt: string;

  /** Optional system prompt to set context */
  systemPrompt?: string;

  /** Temperature (0-2, default 0.7) */
  temperature?: number;

  /** Maximum tokens to generate */
  maxTokens?: number;

  /** Whether to stream the response */
  stream?: boolean;
}

/**
 * Standard response format from all AI providers
 */
export interface AIResponse {
  /** The generated content */
  content: string;

  /** Token usage statistics */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  /** Cost breakdown in USD */
  cost: {
    input: number;
    output: number;
    total: number;
  };

  /** Response latency in milliseconds */
  latency: number;

  /** Provider that generated this response */
  provider: string;

  /** Model that generated this response */
  model: string;
}
