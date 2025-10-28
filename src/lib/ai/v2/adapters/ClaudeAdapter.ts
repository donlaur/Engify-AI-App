/**
 * Claude Provider Adapter
 */

import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, AIRequest, AIResponse } from '../interfaces/AIProvider';

export class ClaudeAdapter implements AIProvider {
  readonly name = 'Claude';
  readonly provider = 'anthropic';
  
  private client: Anthropic;
  private model: string;
  
  constructor(model: string = 'claude-3-haiku-20240307') {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = model;
  }
  
  validateRequest(request: AIRequest): boolean {
    if (!request.prompt || request.prompt.length === 0) return false;
    return true;
  }
  
  async execute(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: request.maxTokens ?? 2000,
      temperature: request.temperature ?? 0.7,
      system: request.systemPrompt,
      messages: [
        { role: 'user', content: request.prompt },
      ],
    });
    
    const latency = Date.now() - startTime;
    
    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';
    
    const usage = {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    };
    
    const cost = {
      input: (usage.promptTokens / 1000000) * 0.25,
      output: (usage.completionTokens / 1000000) * 1.25,
      total: 0,
    };
    cost.total = cost.input + cost.output;
    
    return {
      content: text,
      usage,
      cost,
      latency,
      provider: this.provider,
      model: this.model,
    };
  }
}
