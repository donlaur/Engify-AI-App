export interface UsageRecord {
  id: string;
  userId: string;
  organizationId?: string;
  action: 'ai_execution' | 'prompt_create' | 'api_call';
  provider?: string;
  model?: string;
  tokensUsed: number;
  cost: number;
  timestamp: Date;
}

export interface UsageQuota {
  userId: string;
  organizationId?: string;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  maxAIExecutions: number;
  usedAIExecutions: number;
  resetDate: Date;
}
