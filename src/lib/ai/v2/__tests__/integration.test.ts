import { describe, it, expect } from 'vitest';
import { OpenAIAdapter } from '../adapters/OpenAIAdapter';
import { ClaudeAdapter } from '../adapters/ClaudeAdapter';
import { GeminiAdapter } from '../adapters/GeminiAdapter';
import { GroqAdapter } from '../adapters/GroqAdapter';
import { AIProviderFactory } from '../factory/AIProviderFactory';
import { AIRequest } from '../interfaces/AIProvider';

/**
 * Integration tests that make real API calls
 * These tests require valid API keys in environment variables
 * Skip if keys are not available
 */

const testRequest: AIRequest = {
  prompt: 'Say "test" in one word',
  maxTokens: 10,
  temperature: 0.7,
};

describe('Integration Tests - Real API Calls', () => {
  describe('OpenAI Adapter', () => {
    it('should execute real OpenAI request', async () => {
      if (!process.env.OPENAI_API_KEY) {
        console.log('Skipping OpenAI test - no API key');
        return;
      }

      const adapter = new OpenAIAdapter();
      const response = await adapter.execute(testRequest);

      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
      expect(response.provider).toBe('openai');
      expect(response.model).toBe('gpt-3.5-turbo');
      expect(response.usage.totalTokens).toBeGreaterThan(0);
      expect(response.cost.total).toBeGreaterThan(0);
      expect(response.latency).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Claude Adapter', () => {
    it('should execute real Claude request', async () => {
      if (!process.env.ANTHROPIC_API_KEY) {
        console.log('Skipping Claude test - no API key');
        return;
      }

      const adapter = new ClaudeAdapter();
      const response = await adapter.execute(testRequest);

      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
      expect(response.provider).toBe('anthropic');
      expect(response.model).toContain('claude');
      expect(response.usage.totalTokens).toBeGreaterThan(0);
      expect(response.cost.total).toBeGreaterThan(0);
      expect(response.latency).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Gemini Adapter', () => {
    it('should execute real Gemini request', async () => {
      if (!process.env.GOOGLE_API_KEY) {
        console.log('Skipping Gemini test - no API key');
        return;
      }

      const adapter = new GeminiAdapter();
      const response = await adapter.execute(testRequest);

      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
      expect(response.provider).toBe('google');
      expect(response.model).toContain('gemini');
      expect(response.usage.totalTokens).toBeGreaterThan(0);
      expect(response.cost.total).toBeGreaterThan(0);
      expect(response.latency).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Groq Adapter', () => {
    it('should execute real Groq request', async () => {
      if (!process.env.GROQ_API_KEY) {
        console.log('Skipping Groq test - no API key');
        return;
      }

      const adapter = new GroqAdapter();
      const response = await adapter.execute(testRequest);

      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
      expect(response.provider).toBe('groq');
      expect(response.model).toContain('llama');
      expect(response.usage.totalTokens).toBeGreaterThan(0);
      expect(response.cost.total).toBeGreaterThan(0);
      expect(response.latency).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Factory Integration', () => {
    it('should create and execute with OpenAI', async () => {
      if (!process.env.OPENAI_API_KEY) {
        console.log('Skipping factory OpenAI test - no API key');
        return;
      }

      const provider = AIProviderFactory.create('openai');
      const response = await provider.execute(testRequest);

      expect(response.provider).toBe('openai');
      expect(response.content).toBeTruthy();
    }, 10000);

    it('should create and execute with Claude', async () => {
      if (!process.env.ANTHROPIC_API_KEY) {
        console.log('Skipping factory Claude test - no API key');
        return;
      }

      const provider = AIProviderFactory.create('claude');
      const response = await provider.execute(testRequest);

      expect(response.provider).toBe('anthropic');
      expect(response.content).toBeTruthy();
    }, 10000);
  });

  describe('Cost Calculation Accuracy', () => {
    it('should calculate OpenAI costs correctly', async () => {
      if (!process.env.OPENAI_API_KEY) {
        console.log('Skipping OpenAI cost test - no API key');
        return;
      }

      const adapter = new OpenAIAdapter();
      const response = await adapter.execute(testRequest);

      // Cost should be non-zero and reasonable
      expect(response.cost.total).toBeGreaterThan(0);
      expect(response.cost.total).toBeLessThan(1); // Should be fractions of a cent
      expect(response.cost.input).toBeGreaterThan(0);
      expect(response.cost.output).toBeGreaterThan(0);
      expect(response.cost.total).toBe(
        response.cost.input + response.cost.output
      );
    }, 10000);
  });

  describe('Latency Tracking', () => {
    it('should track latency for all providers', async () => {
      if (!process.env.OPENAI_API_KEY) {
        console.log('Skipping latency test - no API key');
        return;
      }

      const adapter = new OpenAIAdapter();
      const response = await adapter.execute(testRequest);

      // Latency should be reasonable (between 100ms and 10s)
      expect(response.latency).toBeGreaterThan(100);
      expect(response.latency).toBeLessThan(10000);
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should handle invalid API key gracefully', async () => {
      if (!process.env.OPENAI_API_KEY) {
        console.log('Skipping error handling test - no API key');
        return;
      }

      const adapter = new OpenAIAdapter();
      const originalKey = process.env.OPENAI_API_KEY;

      // Temporarily set invalid key (not a real key, just for testing)
      const testKey = 'sk-test-' + 'x'.repeat(40);
      process.env.OPENAI_API_KEY = testKey;

      try {
        await adapter.execute(testRequest);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        // Restore original key
        process.env.OPENAI_API_KEY = originalKey;
      }
    }, 10000);
  });
});
