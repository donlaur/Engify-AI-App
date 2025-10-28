/**
 * OpenAI Provider Adapter
 */

import OpenAI from 'openai';
import { AIProvider, AIRequest, AIResponse } from '../interfaces/AIProvider';

export class OpenAIAdapter implements AIProvider {
  readonly name = 'OpenAI';
  readonly provider = 'openai';
  
  private client: OpenAI;
  private model: string;
  
  constructor(model: string = 'gpt-3.5-turbo') {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = model;
  }
  
  validateRequest(request: AIRequest): boolean {
    if (!request.prompt || request.prompt.length === 0) return false;
    if (request.maxTokens && request.maxTokens > 4096) return false;
    return true;
  }
  
  async execute(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });
    
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2000,
    });
    
    const latency = Date.now() - startTime;
    
    const usage = {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    };
    
    const cost = {
      input: (usage.promptTokens / 1000000) * 0.50,
      output: (usage.completionTokens / 1000000) * 1.50,
      total: 0,
    };
    cost.total = cost.input + cost.output;
    
    return {
      content: response.choices[0]?.message?.content || '',
      usage,
      cost,
      latency,
      provider: this.provider,
      model: this.model,
    };
  }
}
