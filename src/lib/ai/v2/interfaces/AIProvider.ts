/**
 * AI Provider Interface - SOLID Liskov Substitution
 */

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: {
    input: number;
    output: number;
    total: number;
  };
  latency: number;
  provider: string;
  model: string;
}

export interface AIProvider {
  readonly name: string;
  readonly provider: string;
  
  execute(request: AIRequest): Promise<AIResponse>;
  validateRequest(request: AIRequest): boolean;
}
