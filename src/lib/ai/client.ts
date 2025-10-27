/**
 * Universal AI Client
 * Handles requests to all AI providers with consistent interface
 */

import { AIProvider, AIModel, getModel } from './providers';
import { parseAIResponse, ParsedResponse } from './response-parser';

export interface AIRequest {
  model: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  format?: 'text' | 'json';
}

export interface AIResponse {
  content: string;
  parsed: ParsedResponse;
  cost: {
    input: number;
    output: number;
    total: number;
  };
  latency: number; // milliseconds
}

/**
 * Send request to AI provider
 */
export async function sendAIRequest(request: AIRequest): Promise<AIResponse> {
  const startTime = Date.now();
  
  const model = getModel(request.model);
  if (!model) {
    throw new Error(`Model ${request.model} not found`);
  }

  let response: any;
  
  switch (model.provider) {
    case 'openai':
      response = await sendOpenAIRequest(request, model);
      break;
    case 'anthropic':
      response = await sendAnthropicRequest(request, model);
      break;
    case 'google':
      response = await sendGoogleRequest(request, model);
      break;
    case 'perplexity':
      response = await sendPerplexityRequest(request, model);
      break;
    case 'groq':
      response = await sendGroqRequest(request, model);
      break;
    case 'together':
      response = await sendTogetherRequest(request, model);
      break;
    case 'mistral':
      response = await sendMistralRequest(request, model);
      break;
    default:
      throw new Error(`Provider ${model.provider} not supported`);
  }

  const parsed = parseAIResponse(response, model.provider);
  const latency = Date.now() - startTime;

  // Calculate cost
  const inputTokens = parsed.metadata?.tokens?.input || 0;
  const outputTokens = parsed.metadata?.tokens?.output || 0;
  
  const cost = {
    input: (inputTokens / 1000000) * model.inputCostPer1M,
    output: (outputTokens / 1000000) * model.outputCostPer1M,
    total: 0,
  };
  cost.total = cost.input + cost.output;

  return {
    content: parsed.content,
    parsed,
    cost,
    latency,
  };
}

/**
 * OpenAI API request
 */
async function sendOpenAIRequest(request: AIRequest, model: AIModel): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const messages = [];
  if (request.systemPrompt) {
    messages.push({ role: 'system', content: request.systemPrompt });
  }
  messages.push({ role: 'user', content: request.prompt });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model.name,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2000,
      response_format: request.format === 'json' ? { type: 'json_object' } : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Anthropic (Claude) API request
 */
async function sendAnthropicRequest(request: AIRequest, model: AIModel): Promise<any> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model.name,
      max_tokens: request.maxTokens ?? 2000,
      temperature: request.temperature ?? 0.7,
      system: request.systemPrompt,
      messages: [
        { role: 'user', content: request.prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Google (Gemini) API request
 */
async function sendGoogleRequest(request: AIRequest, model: AIModel): Promise<any> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY not configured');

  const contents = [];
  if (request.systemPrompt) {
    contents.push({
      role: 'user',
      parts: [{ text: request.systemPrompt }],
    });
    contents.push({
      role: 'model',
      parts: [{ text: 'Understood. I will follow these instructions.' }],
    });
  }
  contents.push({
    role: 'user',
    parts: [{ text: request.prompt }],
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens ?? 2000,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Perplexity API request
 */
async function sendPerplexityRequest(request: AIRequest, model: AIModel): Promise<any> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error('PERPLEXITY_API_KEY not configured');

  const messages = [];
  if (request.systemPrompt) {
    messages.push({ role: 'system', content: request.systemPrompt });
  }
  messages.push({ role: 'user', content: request.prompt });

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model.name,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Groq API request
 */
async function sendGroqRequest(request: AIRequest, model: AIModel): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const messages = [];
  if (request.systemPrompt) {
    messages.push({ role: 'system', content: request.systemPrompt });
  }
  messages.push({ role: 'user', content: request.prompt });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model.name,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Together AI API request
 */
async function sendTogetherRequest(request: AIRequest, model: AIModel): Promise<any> {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) throw new Error('TOGETHER_API_KEY not configured');

  const messages = [];
  if (request.systemPrompt) {
    messages.push({ role: 'system', content: request.systemPrompt });
  }
  messages.push({ role: 'user', content: request.prompt });

  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model.name,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Together API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Mistral API request
 */
async function sendMistralRequest(request: AIRequest, model: AIModel): Promise<any> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error('MISTRAL_API_KEY not configured');

  const messages = [];
  if (request.systemPrompt) {
    messages.push({ role: 'system', content: request.systemPrompt });
  }
  messages.push({ role: 'user', content: request.prompt });

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model.name,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.statusText}`);
  }

  return response.json();
}
