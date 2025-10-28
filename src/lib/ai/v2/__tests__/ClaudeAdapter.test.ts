import { describe, it, expect, beforeEach } from 'vitest';
import { ClaudeAdapter } from '../adapters/ClaudeAdapter';
import { AIRequest } from '../interfaces/AIProvider';

describe('ClaudeAdapter', () => {
  let adapter: ClaudeAdapter;

  beforeEach(() => {
    adapter = new ClaudeAdapter();
  });

  describe('Interface Implementation', () => {
    it('should implement AIProvider interface', () => {
      expect(adapter.name).toBe('Claude');
      expect(adapter.provider).toBe('anthropic');
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

    it('should reject whitespace-only prompt', () => {
      const invalidRequest: AIRequest = {
        prompt: '   ',
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

    it('should accept valid temperature at boundaries', () => {
      const request1: AIRequest = { prompt: 'Hello', temperature: 0 };
      const request2: AIRequest = { prompt: 'Hello', temperature: 1 };

      expect(adapter.validateRequest(request1)).toBe(true);
      expect(adapter.validateRequest(request2)).toBe(true);
    });
  });

  describe('Model Configuration', () => {
    it('should use default model when not specified', () => {
      const defaultAdapter = new ClaudeAdapter();
      expect(defaultAdapter).toBeDefined();
    });

    it('should accept custom model', () => {
      const customAdapter = new ClaudeAdapter('claude-3-5-sonnet-20241022');
      expect(customAdapter).toBeDefined();
    });
  });
});
