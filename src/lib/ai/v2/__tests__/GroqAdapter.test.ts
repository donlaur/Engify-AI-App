/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest';
import { GroqAdapter } from '../adapters/GroqAdapter';
import { AIRequest } from '../interfaces/AIProvider';

describe('GroqAdapter', () => {
  let adapter: GroqAdapter;

  beforeEach(() => {
    adapter = new GroqAdapter();
  });

  describe('Interface Implementation', () => {
    it('should implement AIProvider interface', () => {
      expect(adapter.name).toBe('Groq');
      expect(adapter.provider).toBe('groq');
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

    it('should reject temperature above 2', () => {
      const invalidRequest: AIRequest = {
        prompt: 'Hello',
        temperature: 2.1,
      };

      expect(adapter.validateRequest(invalidRequest)).toBe(false);
    });
  });

  describe('Model Configuration', () => {
    it('should use default model when not specified', () => {
      const defaultAdapter = new GroqAdapter();
      expect(defaultAdapter).toBeDefined();
    });

    it('should accept custom model', () => {
      const customAdapter = new GroqAdapter('llama3-70b-8192');
      expect(customAdapter).toBeDefined();
    });
  });
});
