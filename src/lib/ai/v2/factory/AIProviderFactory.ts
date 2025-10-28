/**
 * AI Provider Factory - Factory Pattern
 */

import { AIProvider } from '../interfaces/AIProvider';
import { OpenAIAdapter } from '../adapters/OpenAIAdapter';
import { ClaudeAdapter } from '../adapters/ClaudeAdapter';

export class AIProviderFactory {
  private static providers: Map<string, () => AIProvider> = new Map([
    ['openai', () => new OpenAIAdapter()],
    ['openai-gpt4', () => new OpenAIAdapter('gpt-4')],
    ['claude', () => new ClaudeAdapter()],
    ['claude-sonnet', () => new ClaudeAdapter('claude-3-5-sonnet-20241022')],
  ]);
  
  static create(providerName: string): AIProvider {
    const factory = this.providers.get(providerName);
    if (!factory) {
      throw new Error(`Provider ${providerName} not found`);
    }
    return factory();
  }
  
  static register(name: string, factory: () => AIProvider): void {
    this.providers.set(name, factory);
  }
  
  static getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
