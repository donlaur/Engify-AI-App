import { describe, it, expect } from 'vitest';
import { AIProviderFactory } from '../factory/AIProviderFactory';
import { OpenAIAdapter } from '../adapters/OpenAIAdapter';
import { ClaudeAdapter } from '../adapters/ClaudeAdapter';
import { GeminiAdapter } from '../adapters/GeminiAdapter';
import { GroqAdapter } from '../adapters/GroqAdapter';

describe('AIProviderFactory', () => {
  describe('Provider Creation', () => {
    it('should create OpenAI provider', () => {
      const provider = AIProviderFactory.create('openai');
      expect(provider).toBeInstanceOf(OpenAIAdapter);
      expect(provider.name).toBe('OpenAI');
      expect(provider.provider).toBe('openai');
    });

    it('should create Claude provider', () => {
      const provider = AIProviderFactory.create('claude');
      expect(provider).toBeInstanceOf(ClaudeAdapter);
      expect(provider.name).toBe('Claude');
      expect(provider.provider).toBe('anthropic');
    });

    it('should create Gemini provider', () => {
      const provider = AIProviderFactory.create('gemini');
      expect(provider).toBeInstanceOf(GeminiAdapter);
      expect(provider.name).toBe('Gemini');
      expect(provider.provider).toBe('google');
    });

    it('should create Groq provider', () => {
      const provider = AIProviderFactory.create('groq');
      expect(provider).toBeInstanceOf(GroqAdapter);
      expect(provider.name).toBe('Groq');
      expect(provider.provider).toBe('groq');
    });

    it('should throw error for unknown provider', () => {
      expect(() => {
        AIProviderFactory.create('unknown-provider');
      }).toThrow('Provider "unknown-provider" not found');
    });
  });

  describe('Provider Variants', () => {
    it('should create GPT-4 variant', () => {
      const provider = AIProviderFactory.create('openai-gpt4');
      expect(provider).toBeInstanceOf(OpenAIAdapter);
    });

    it('should create Claude Sonnet variant', () => {
      const provider = AIProviderFactory.create('claude-sonnet');
      expect(provider).toBeInstanceOf(ClaudeAdapter);
    });

    it('should create Gemini Flash variant', () => {
      const provider = AIProviderFactory.create('gemini-flash');
      expect(provider).toBeInstanceOf(GeminiAdapter);
    });

    it('should create Groq Llama3-70b variant', () => {
      const provider = AIProviderFactory.create('groq-llama3-70b');
      expect(provider).toBeInstanceOf(GroqAdapter);
    });
  });

  describe('Provider Registry', () => {
    it('should list all available providers', () => {
      const providers = AIProviderFactory.getAvailableProviders();

      expect(providers).toContain('openai');
      expect(providers).toContain('claude');
      expect(providers).toContain('gemini');
      expect(providers).toContain('groq');
      expect(providers.length).toBeGreaterThan(10);
    });

    it('should check if provider exists', () => {
      expect(AIProviderFactory.hasProvider('openai')).toBe(true);
      expect(AIProviderFactory.hasProvider('claude')).toBe(true);
      expect(AIProviderFactory.hasProvider('unknown')).toBe(false);
    });

    it('should get providers by category', () => {
      const categories = AIProviderFactory.getProvidersByCategory();

      expect(categories).toHaveProperty('OpenAI');
      expect(categories).toHaveProperty('Anthropic');
      expect(categories).toHaveProperty('Google');
      expect(categories).toHaveProperty('Groq');

      expect(categories['OpenAI']).toContain('openai');
      expect(categories['Anthropic']).toContain('claude');
      expect(categories['Google']).toContain('gemini');
      expect(categories['Groq']).toContain('groq');
    });
  });

  describe('Custom Provider Registration', () => {
    it('should allow registering custom provider', () => {
      const customFactory = () => new OpenAIAdapter('custom-model');

      AIProviderFactory.register('custom-openai', customFactory);

      expect(AIProviderFactory.hasProvider('custom-openai')).toBe(true);

      const provider = AIProviderFactory.create('custom-openai');
      expect(provider).toBeInstanceOf(OpenAIAdapter);
    });
  });

  describe('Provider Interface Compliance', () => {
    it('all providers should implement AIProvider interface', () => {
      const providerNames = ['openai', 'claude', 'gemini', 'groq'];

      providerNames.forEach((name) => {
        const provider = AIProviderFactory.create(name);

        expect(provider).toHaveProperty('name');
        expect(provider).toHaveProperty('provider');
        expect(typeof provider.execute).toBe('function');
        expect(typeof provider.validateRequest).toBe('function');
      });
    });
  });
});
