import { describe, it, expect, beforeEach } from 'vitest';
import { GeminiAdapter } from '../adapters/GeminiAdapter';
import { AIRequest } from '../interfaces/AIProvider';

describe('GeminiAdapter', () => {
  let adapter: GeminiAdapter;

  beforeEach(() => {
    adapter = new GeminiAdapter();
  });

  describe('Interface Implementation', () => {
    it('should implement AIProvider interface', () => {
      expect(adapter.name).toBe('Gemini');
      expect(adapter.provider).toBe('google');
      expect(typeof adapter.execute).toBe('function');
      expect(typeof adapter.validateRequest).toBe('function');
    });
  });

  describe('Request Validation', () => {
    it('should validate a correct request', () => {
      const validRequest: AIRequest = {
        prompt: 'Hello, world!',
        systemPrompt: 'You are a helpful assistant',
        temperature: 0.7,
        maxTokens: 1000,
      };

      expect(adapter.validateRequest(validRequest)).toBe(true);
    });

    it('should reject empty prompt', () => {
      const invalidRequest: AIRequest = {
        prompt: '',
      };

      expect(adapter.validateRequest(invalidRequest)).toBe(false);
    });

    it('should reject temperature below 0', () => {
      const invalidRequest: AIRequest = {
        prompt: 'Hello',
        temperature: -0.1,
      };

      expect(adapter.validateRequest(invalidRequest)).toBe(false);
    });

    it('should reject temperature above 1', () => {
      const invalidRequest: AIRequest = {
        prompt: 'Hello',
        temperature: 1.1,
      };

      expect(adapter.validateRequest(invalidRequest)).toBe(false);
    });
  });

  describe('Model Configuration', () => {
    it('should use default model when not specified', () => {
      const defaultAdapter = new GeminiAdapter();
      expect(defaultAdapter).toBeDefined();
    });

    it('should accept custom model', () => {
      const customAdapter = new GeminiAdapter('gemini-1.5-flash');
      expect(customAdapter).toBeDefined();
    });
  });
});
