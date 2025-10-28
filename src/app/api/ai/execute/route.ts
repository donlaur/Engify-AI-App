/**
 * AI Execution API
 * Executes prompts with OpenAI API
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { checkRateLimit, getClientIp, trackTokenUsage } from '@/lib/rate-limit';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

const executeSchema = z.object({
  prompt: z.string().min(1).max(10000),
  provider: z.enum(['openai', 'anthropic', 'google', 'groq']).default('openai'),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
});

export async function POST(req: NextRequest) {
  try {
    // Get user session (optional for demo)
    const session = await auth();

    // Determine rate limit tier and identifier
    const tier = session?.user ? 'authenticated' : 'anonymous';
    const identifier = session?.user?.email || getClientIp(req);

    // Check rate limit
    const rateLimit = await checkRateLimit(identifier, tier);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: rateLimit.reason,
          resetAt: rateLimit.resetAt,
          tier,
        },
        { status: 429 }
      );
    }

    // Parse and validate request
    const body = await req.json();
    const {
      prompt,
      provider,
      model: requestedModel,
      temperature,
    } = executeSchema.parse(body);

    // Determine model based on provider
    const model = requestedModel || getDefaultModel(provider);

    // Execute based on provider
    let completion = '';
    let usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    try {
      switch (provider) {
        case 'openai':
          ({ completion, usage } = await executeOpenAI(
            prompt,
            model,
            temperature
          ));
          break;
        case 'anthropic':
          ({ completion, usage } = await executeAnthropic(
            prompt,
            model,
            temperature
          ));
          break;
        case 'google':
          ({ completion, usage } = await executeGoogle(
            prompt,
            model,
            temperature
          ));
          break;
        case 'groq':
          ({ completion, usage } = await executeGroq(
            prompt,
            model,
            temperature
          ));
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`${provider} execution error:`, error);
      return NextResponse.json(
        {
          error: `${provider} execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
        { status: 500 }
      );
    }

    // Track token usage for rate limiting
    if (usage.total_tokens) {
      await trackTokenUsage(identifier, usage.total_tokens);
    }

    // Return response with usage stats and rate limit info
    return NextResponse.json({
      response: completion,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      },
      rateLimit: {
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt,
        tier,
      },
      model,
      provider,
    });
  } catch (error) {
    console.error('AI execution error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions for each provider
function getDefaultModel(provider: string): string {
  const defaults: Record<string, string> = {
    openai: 'gpt-3.5-turbo',
    anthropic: 'claude-3-haiku-20240307',
    google: 'gemini-1.5-flash',
    groq: 'llama-3.1-8b-instant',
  };
  return defaults[provider] || 'gpt-3.5-turbo';
}

async function executeOpenAI(
  prompt: string,
  model: string,
  temperature: number
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens: 2000,
  });

  return {
    completion: response.choices[0]?.message?.content || '',
    usage: {
      prompt_tokens: response.usage?.prompt_tokens || 0,
      completion_tokens: response.usage?.completion_tokens || 0,
      total_tokens: response.usage?.total_tokens || 0,
    },
  };
}

async function executeAnthropic(
  prompt: string,
  model: string,
  temperature: number
) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model,
    max_tokens: 2000,
    temperature,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  const text = content.type === 'text' ? content.text : '';

  return {
    completion: text,
    usage: {
      prompt_tokens: response.usage.input_tokens,
      completion_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens,
    },
  };
}

async function executeGoogle(
  prompt: string,
  model: string,
  temperature: number
) {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('Google API key not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const gemini = genAI.getGenerativeModel({ model });

  const result = await gemini.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: 2000,
    },
  });

  const response = result.response;
  const text = response.text();

  // Gemini doesn't provide detailed token counts in the same way
  const estimatedTokens = Math.ceil(text.length / 4);

  return {
    completion: text,
    usage: {
      prompt_tokens: Math.ceil(prompt.length / 4),
      completion_tokens: estimatedTokens,
      total_tokens: Math.ceil(prompt.length / 4) + estimatedTokens,
    },
  };
}

async function executeGroq(prompt: string, model: string, temperature: number) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens: 2000,
  });

  return {
    completion: response.choices[0]?.message?.content || '',
    usage: {
      prompt_tokens: response.usage?.prompt_tokens || 0,
      completion_tokens: response.usage?.completion_tokens || 0,
      total_tokens: response.usage?.total_tokens || 0,
    },
  };
}
