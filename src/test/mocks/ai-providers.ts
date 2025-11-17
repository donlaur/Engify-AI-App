/**
 * AI Provider Mocking Utilities
 *
 * Mock implementations for AI provider SDKs (OpenAI, Anthropic, Google, Groq)
 */

import { vi } from 'vitest';

/**
 * Mock OpenAI SDK
 */
export function createMockOpenAI(options: {
  response?: string;
  error?: Error;
  streaming?: boolean;
} = {}) {
  const {
    response = 'This is a mock OpenAI response',
    error,
    streaming = false,
  } = options;

  const create = vi.fn(async () => {
    if (error) throw error;

    if (streaming) {
      return {
        [Symbol.asyncIterator]: async function* () {
          const words = response.split(' ');
          for (const word of words) {
            yield {
              choices: [{ delta: { content: word + ' ' } }],
            };
          }
        },
      };
    }

    return {
      id: `chatcmpl-${Math.random().toString(36).substr(2, 9)}`,
      object: 'chat.completion',
      created: Date.now(),
      model: 'gpt-4', // Test mock data - intentionally hardcoded
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: response,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
    };
  });

  return {
    chat: {
      completions: {
        create,
      },
    },
    embeddings: {
      create: vi.fn(async () => ({
        data: [
          {
            embedding: Array.from({ length: 1536 }, () => Math.random()),
          },
        ],
      })),
    },
  };
}

/**
 * Mock Anthropic SDK
 */
export function createMockAnthropic(options: {
  response?: string;
  error?: Error;
  streaming?: boolean;
} = {}) {
  const {
    response = 'This is a mock Anthropic response',
    error,
    streaming = false,
  } = options;

  const create = vi.fn(async () => {
    if (error) throw error;

    if (streaming) {
      return {
        [Symbol.asyncIterator]: async function* () {
          yield {
            type: 'content_block_start',
            index: 0,
            content_block: { type: 'text', text: '' },
          };

          const words = response.split(' ');
          for (const word of words) {
            yield {
              type: 'content_block_delta',
              index: 0,
              delta: { type: 'text_delta', text: word + ' ' },
            };
          }

          yield { type: 'content_block_stop', index: 0 };
        },
      };
    }

    return {
      id: `msg_${Math.random().toString(36).substr(2, 9)}`,
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: response,
        },
      ],
      model: 'claude-3-opus-20240229', // Test mock data - intentionally hardcoded
      stop_reason: 'end_turn',
      usage: {
        input_tokens: 10,
        output_tokens: 20,
      },
    };
  });

  return {
    messages: {
      create,
    },
  };
}

/**
 * Mock Google Generative AI SDK
 */
export function createMockGoogleAI(options: {
  response?: string;
  error?: Error;
  streaming?: boolean;
} = {}) {
  const {
    response = 'This is a mock Google AI response',
    error,
    streaming = false,
  } = options;

  const generateContent = vi.fn(async () => {
    if (error) throw error;

    if (streaming) {
      return {
        stream: async function* () {
          const words = response.split(' ');
          for (const word of words) {
            yield {
              text: () => word + ' ',
            };
          }
        },
      };
    }

    return {
      response: {
        text: () => response,
        candidates: [
          {
            content: {
              parts: [{ text: response }],
            },
            finishReason: 'STOP',
          },
        ],
      },
    };
  });

  return {
    getGenerativeModel: vi.fn(() => ({
      generateContent,
      generateContentStream: generateContent,
    })),
  };
}

/**
 * Mock Groq SDK
 */
export function createMockGroq(options: {
  response?: string;
  error?: Error;
} = {}) {
  const { response = 'This is a mock Groq response', error } = options;

  return {
    chat: {
      completions: {
        create: vi.fn(async () => {
          if (error) throw error;

          return {
            id: `groq-${Math.random().toString(36).substr(2, 9)}`,
            object: 'chat.completion',
            created: Date.now(),
            model: 'mixtral-8x7b-32768',
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  content: response,
                },
                finish_reason: 'stop',
              },
            ],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 20,
              total_tokens: 30,
            },
          };
        }),
      },
    },
  };
}

/**
 * Mock Replicate SDK
 */
export function createMockReplicate(options: {
  response?: string;
  error?: Error;
} = {}) {
  const { response = 'This is a mock Replicate response', error } = options;

  return {
    run: vi.fn(async () => {
      if (error) throw error;
      return response;
    }),
    predictions: {
      create: vi.fn(async () => {
        if (error) throw error;
        return {
          id: `replicate-${Math.random().toString(36).substr(2, 9)}`,
          status: 'succeeded',
          output: response,
        };
      }),
    },
  };
}

/**
 * Create a mock AI provider factory
 */
export function createMockAIProviderFactory() {
  return {
    openai: createMockOpenAI,
    anthropic: createMockAnthropic,
    google: createMockGoogleAI,
    groq: createMockGroq,
    replicate: createMockReplicate,
  };
}

/**
 * AI Provider response builder for testing
 */
export class AIResponseBuilder {
  private provider: string = 'openai';
  private model: string = 'gpt-4';
  private content: string = 'Test response';
  private tokens: { input: number; output: number } = {
    input: 10,
    output: 20,
  };
  private errorResponse?: Error;
  private isStreaming: boolean = false;

  withProvider(provider: string): this {
    this.provider = provider;
    return this;
  }

  withModel(model: string): this {
    this.model = model;
    return this;
  }

  withContent(content: string): this {
    this.content = content;
    return this;
  }

  withTokens(input: number, output: number): this {
    this.tokens = { input, output };
    return this;
  }

  withError(error: Error): this {
    this.errorResponse = error;
    return this;
  }

  streaming(): this {
    this.isStreaming = true;
    return this;
  }

  build() {
    return {
      provider: this.provider,
      model: this.model,
      content: this.content,
      tokens: this.tokens,
      error: this.errorResponse,
      streaming: this.isStreaming,
    };
  }
}

/**
 * Common AI error scenarios for testing
 */
export const aiErrors = {
  rateLimited: () =>
    new Error('Rate limit exceeded. Please try again later.'),
  invalidApiKey: () => new Error('Invalid API key provided'),
  contextLengthExceeded: () =>
    new Error('Maximum context length exceeded'),
  serviceUnavailable: () => new Error('Service temporarily unavailable'),
  timeout: () => new Error('Request timeout'),
  invalidRequest: () => new Error('Invalid request parameters'),
};
