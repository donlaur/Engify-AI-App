/**
 * Groq Client
 * Fastest AI inference (10x faster than others)
 * Great for real-time applications and demos
 */

import Groq from 'groq-sdk';

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  content: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  responseTime: number;
}

/**
 * Send message to Groq
 */
export async function sendToGroq(
  messages: GroqMessage[],
  model: string = 'llama-3.1-70b-versatile',
  maxTokens: number = 8192
): Promise<GroqResponse> {
  const startTime = Date.now();

  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    const responseTime = Date.now() - startTime;
    const content = response.choices[0]?.message?.content || '';

    return {
      content,
      model: response.model,
      usage: {
        prompt_tokens: response.usage?.prompt_tokens || 0,
        completion_tokens: response.usage?.completion_tokens || 0,
        total_tokens: response.usage?.total_tokens || 0,
      },
      responseTime,
    };
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error(
      `Groq API error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Test prompt with Groq (FAST mode)
 */
export async function testPromptWithGroq(
  prompt: string,
  systemPrompt?: string
): Promise<GroqResponse> {
  const messages: GroqMessage[] = [];

  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  messages.push({
    role: 'user',
    content: prompt,
  });

  // Use fastest model for testing
  return sendToGroq(messages, 'llama-3.1-8b-instant');
}
