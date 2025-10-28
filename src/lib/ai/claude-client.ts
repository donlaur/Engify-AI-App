/**
 * Anthropic Claude Client
 * For complex reasoning and enterprise use cases
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  content: string;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Send message to Claude
 */
export async function sendToClaud(
  messages: ClaudeMessage[],
  model: string = 'claude-3-5-sonnet-20241022',
  maxTokens: number = 4096
): Promise<ClaudeResponse> {
  try {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';

    return {
      content: text,
      model: response.model,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    };
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error(
      `Claude API error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Test prompt with Claude
 */
export async function testPromptWithClaude(
  prompt: string,
  _systemPrompt?: string
): Promise<ClaudeResponse> {
  const messages: ClaudeMessage[] = [
    {
      role: 'user',
      content: prompt,
    },
  ];

  return sendToClaud(messages, 'claude-3-5-sonnet-20241022');
}
