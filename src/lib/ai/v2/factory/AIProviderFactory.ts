import { AIProvider } from '../interfaces/AIProvider';
import { OpenAIAdapter } from '../adapters/OpenAIAdapter';
import { ClaudeAdapter } from '../adapters/ClaudeAdapter';
import { GeminiAdapter } from '../adapters/GeminiAdapter';
import { GroqAdapter } from '../adapters/GroqAdapter';
import { ReplicateAdapter } from '../adapters/ReplicateAdapter';

/**
 * AIProviderFactory
 *
 * Factory pattern for creating AI provider instances.
 * Centralizes provider instantiation and makes it easy to add new providers.
 *
 * SOLID Principles:
 * - Open/Closed: Add new providers without modifying existing code
 * - Dependency Inversion: Clients depend on AIProvider interface, not concrete classes
 */
export class AIProviderFactory {
  /**
   * Registry of available providers
   * Maps provider names to factory functions
   */
  private static providers: Map<string, () => AIProvider> = new Map<
    string,
    () => AIProvider
  >([
    // OpenAI models
    ['openai', () => new OpenAIAdapter('gpt-3.5-turbo')],
    ['openai-gpt4', () => new OpenAIAdapter('gpt-4')],
    ['openai-gpt4-turbo', () => new OpenAIAdapter('gpt-4-turbo-preview')],

    // Claude models
    ['claude', () => new ClaudeAdapter('claude-3-haiku-20240307')],
    ['claude-haiku', () => new ClaudeAdapter('claude-3-haiku-20240307')],
    ['claude-sonnet', () => new ClaudeAdapter('claude-3-5-sonnet-20241022')],
    ['claude-opus', () => new ClaudeAdapter('claude-3-opus-20240229')],

    // Gemini models
    ['gemini', () => new GeminiAdapter('gemini-pro')],
    ['gemini-pro', () => new GeminiAdapter('gemini-pro')],
    ['gemini-flash', () => new GeminiAdapter('gemini-1.5-flash')],

    // Groq models (ultra-fast inference)
    ['groq', () => new GroqAdapter('llama3-8b-8192')],
    ['groq-llama3-8b', () => new GroqAdapter('llama3-8b-8192')],
    ['groq-llama3-70b', () => new GroqAdapter('llama3-70b-8192')],
    ['groq-mixtral', () => new GroqAdapter('mixtral-8x7b-32768')],

    // Replicate (scaffold) — fast LLM placeholder, swap model when finalized
    ['replicate-flash', () => new ReplicateAdapter('gemini-2.5-flash')],
  ]);

  /**
   * Create an AI provider instance
   * @param providerName - The name of the provider to create
   * @returns AIProvider instance
   * @throws Error if provider not found
   */
  static create(providerName: string): AIProvider {
    const factory = this.providers.get(providerName);

    if (!factory) {
      throw new Error(
        `Provider "${providerName}" not found. Available providers: ${this.getAvailableProviders().join(', ')}`
      );
    }

    return factory();
  }

  /**
   * Register a new provider
   * Allows extending the factory with custom providers
   * @param name - The name to register the provider under
   * @param factory - Factory function that creates the provider
   */
  static register(name: string, factory: () => AIProvider): void {
    this.providers.set(name, factory);
  }

  /**
   * Get list of all available provider names
   * @returns Array of provider names
   */
  static getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a provider is available
   * @param providerName - The provider name to check
   * @returns true if provider exists
   */
  static hasProvider(providerName: string): boolean {
    return this.providers.has(providerName);
  }

  /**
   * Get provider categories for UI organization
   * @returns Categorized provider list
   */
  static getProvidersByCategory(): Record<string, string[]> {
    return {
      OpenAI: ['openai', 'openai-gpt4', 'openai-gpt4-turbo'],
      Anthropic: ['claude', 'claude-haiku', 'claude-sonnet', 'claude-opus'],
      Google: ['gemini', 'gemini-pro', 'gemini-flash'],
      Groq: ['groq', 'groq-llama3-8b', 'groq-llama3-70b', 'groq-mixtral'],
      Replicate: ['replicate-flash'],
    };
  }
}
