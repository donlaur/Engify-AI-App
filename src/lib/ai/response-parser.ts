/**
 * AI Response Parser
 * Handles responses from different AI providers (JSON, XML, plain text)
 */

export interface ParsedResponse {
  content: string;
  raw: unknown;
  format: 'text' | 'json' | 'xml' | 'markdown';
  metadata?: {
    model?: string;
    tokens?: {
      input: number;
      output: number;
      total: number;
    };
    finishReason?: string;
    [key: string]: unknown;
  };
}

/**
 * OpenAI API response structure
 */
interface OpenAIResponse {
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string;
  }>;
  model?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

/**
 * Anthropic API response structure
 */
interface AnthropicResponse {
  content?: Array<{ text?: string }>;
  model?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
  stop_reason?: string;
}

/**
 * Google API response structure
 */
interface GoogleResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  modelVersion?: string;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

/**
 * Parse OpenAI response
 */
export function parseOpenAIResponse(response: OpenAIResponse): ParsedResponse {
  const choice = response.choices?.[0];
  const content = choice?.message?.content || '';
  
  return {
    content,
    raw: response,
    format: detectFormat(content),
    metadata: {
      model: response.model,
      tokens: {
        input: response.usage?.prompt_tokens || 0,
        output: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0,
      },
      finishReason: choice?.finish_reason,
    },
  };
}

/**
 * Parse Anthropic (Claude) response
 */
export function parseAnthropicResponse(response: AnthropicResponse): ParsedResponse {
  const content = response.content?.[0]?.text || '';
  
  return {
    content,
    raw: response,
    format: detectFormat(content),
    metadata: {
      model: response.model,
      tokens: {
        input: response.usage?.input_tokens || 0,
        output: response.usage?.output_tokens || 0,
        total: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
      },
      finishReason: response.stop_reason,
    },
  };
}

/**
 * Parse Google (Gemini) response
 */
export function parseGoogleResponse(response: GoogleResponse): ParsedResponse {
  const candidate = response.candidates?.[0];
  const content = candidate?.content?.parts?.[0]?.text || '';
  
  return {
    content,
    raw: response,
    format: detectFormat(content),
    metadata: {
      model: response.modelVersion,
      tokens: {
        input: response.usageMetadata?.promptTokenCount || 0,
        output: response.usageMetadata?.candidatesTokenCount || 0,
        total: response.usageMetadata?.totalTokenCount || 0,
      },
      finishReason: candidate?.finishReason,
    },
  };
}

/**
 * Perplexity API response structure (similar to OpenAI)
 */
interface PerplexityResponse {
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string;
  }>;
  model?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

/**
 * Parse Perplexity response
 */
export function parsePerplexityResponse(response: PerplexityResponse): ParsedResponse {
  const choice = response.choices?.[0];
  const content = choice?.message?.content || '';
  
  return {
    content,
    raw: response,
    format: detectFormat(content),
    metadata: {
      model: response.model,
      tokens: {
        input: response.usage?.prompt_tokens || 0,
        output: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0,
      },
      finishReason: choice?.finish_reason,
      citations: (response as { citations?: unknown }).citations, // Perplexity includes citations!
    },
  };
}

/**
 * Groq API response structure
 */
interface GroqResponse {
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string;
  }>;
  model?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  x_groq?: unknown; // Groq-specific metadata
}

/**
 * Parse Groq response
 */
export function parseGroqResponse(response: GroqResponse): ParsedResponse {
  const choice = response.choices?.[0];
  const content = choice?.message?.content || '';

  return {
    content,
    raw: response,
    format: detectFormat(content),
    metadata: {
      model: response.model,
      tokens: {
        input: response.usage?.prompt_tokens || 0,
        output: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0,
      },
      finishReason: choice?.finish_reason,
      xGroq: response.x_groq, // Groq-specific metadata
    },
  };
}

/**
 * Together AI response structure
 */
interface TogetherResponse {
  choices?: Array<{
    message?: { content?: string };
    text?: string;
    finish_reason?: string;
  }>;
  model?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

/**
 * Parse Together AI response
 */
export function parseTogetherResponse(response: TogetherResponse): ParsedResponse {
  const choice = response.choices?.[0];
  const content = choice?.message?.content || choice?.text || '';

  return {
    content,
    raw: response,
    format: detectFormat(content),
    metadata: {
      model: response.model,
      tokens: {
        input: response.usage?.prompt_tokens || 0,
        output: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0,
      },
      finishReason: choice?.finish_reason,
    },
  };
}

/**
 * Mistral AI response structure
 */
interface MistralResponse {
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string;
  }>;
  model?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

/**
 * Parse Mistral response
 */
export function parseMistralResponse(response: MistralResponse): ParsedResponse {
  const choice = response.choices?.[0];
  const content = choice?.message?.content || '';
  
  return {
    content,
    raw: response,
    format: detectFormat(content),
    metadata: {
      model: response.model,
      tokens: {
        input: response.usage?.prompt_tokens || 0,
        output: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0,
      },
      finishReason: choice?.finish_reason,
    },
  };
}

/**
 * Universal response parser
 * Automatically detects provider and parses accordingly
 */
export function parseAIResponse(response: any, provider?: string): ParsedResponse {
  // Try to detect provider from response
  if (!provider) {
    if (response.model?.includes('gpt')) provider = 'openai';
    else if (response.model?.includes('claude')) provider = 'anthropic';
    else if (response.model?.includes('gemini')) provider = 'google';
    else if (response.model?.includes('sonar')) provider = 'perplexity';
    else if (response.model?.includes('llama') || response.x_groq) provider = 'groq';
    else if (response.model?.includes('mistral')) provider = 'mistral';
  }

  switch (provider) {
    case 'openai':
      return parseOpenAIResponse(response);
    case 'anthropic':
      return parseAnthropicResponse(response);
    case 'google':
      return parseGoogleResponse(response);
    case 'perplexity':
      return parsePerplexityResponse(response);
    case 'groq':
      return parseGroqResponse(response);
    case 'together':
      return parseTogetherResponse(response);
    case 'mistral':
      return parseMistralResponse(response);
    default:
      // Fallback: try to extract content from common structures
      return parseFallback(response);
  }
}

/**
 * Fallback parser for unknown providers
 */
function parseFallback(response: any): ParsedResponse {
  let content = '';
  
  // Try common response structures
  if (response.choices?.[0]?.message?.content) {
    content = response.choices[0].message.content;
  } else if (response.choices?.[0]?.text) {
    content = response.choices[0].text;
  } else if (response.content?.[0]?.text) {
    content = response.content[0].text;
  } else if (response.text) {
    content = response.text;
  } else if (typeof response === 'string') {
    content = response;
  }

  return {
    content,
    raw: response,
    format: detectFormat(content),
  };
}

/**
 * Detect content format
 */
function detectFormat(content: string): 'text' | 'json' | 'xml' | 'markdown' {
  if (!content) return 'text';
  
  const trimmed = content.trim();
  
  // Check for JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not valid JSON
    }
  }
  
  // Check for XML
  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    return 'xml';
  }
  
  // Check for Markdown
  if (trimmed.includes('```') || 
      trimmed.includes('##') || 
      trimmed.includes('**') ||
      trimmed.includes('- ')) {
    return 'markdown';
  }
  
  return 'text';
}

/**
 * Extract JSON from response
 */
export function extractJSON(content: string): any | null {
  try {
    // Try direct parse
    return JSON.parse(content);
  } catch {
    // Try to find JSON in markdown code blocks
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        return null;
      }
    }
    
    // Try to find JSON object in text
    const objectMatch = content.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        return null;
      }
    }
    
    return null;
  }
}

/**
 * Extract XML from response
 */
export function extractXML(content: string): string | null {
  const xmlMatch = content.match(/<[\s\S]*>/);
  return xmlMatch ? xmlMatch[0] : null;
}

/**
 * Parse XML to object (simple parser)
 */
export function parseXMLToObject(xml: string): any {
  // Simple XML parser - for complex XML, use a library
  const result: any = {};
  const tagRegex = /<(\w+)>(.*?)<\/\1>/g;
  let match;
  
  while ((match = tagRegex.exec(xml)) !== null) {
    const [, tag, content] = match;
    result[tag] = content;
  }
  
  return result;
}
