/**
 * Protected AI Client
 * Wraps AI client with usage tracking and firewall
 */

import { sendAIRequest, AIRequest, AIResponse } from './client';
import { checkFirewall } from './firewall';
import { trackUsage, checkUsageLimits } from './usage-tracker';

export interface ProtectedAIRequest extends AIRequest {
  userId: string;
  userTier?: string;
  sessionId?: string;
}

export interface ProtectedAIResponse extends AIResponse {
  usageInfo: {
    allowed: boolean;
    reason?: string;
    tokensUsed: number;
    costIncurred: number;
    remainingToday: {
      requests: number;
      tokens: number;
      cost: number;
    };
  };
}

/**
 * Send AI request with protection
 */
export async function sendProtectedAIRequest(
  request: ProtectedAIRequest
): Promise<ProtectedAIResponse> {
  const startTime = Date.now();
  
  // Step 1: Check firewall
  const firewallResult = await checkFirewall(request.prompt);
  if (!firewallResult.allowed) {
    throw new Error(`Firewall blocked: ${firewallResult.reason}`);
  }

  // Step 2: Estimate tokens (rough estimate)
  const estimatedTokens = Math.ceil(request.prompt.length / 4) + (request.maxTokens || 2000);

  // Step 3: Check usage limits
  const usageCheck = await checkUsageLimits(
    request.userId,
    request.userTier || 'free',
    estimatedTokens
  );

  if (!usageCheck.allowed) {
    const response: ProtectedAIResponse = {
      content: '',
      parsed: {
        content: '',
        raw: {},
        format: 'text',
      },
      cost: {
        input: 0,
        output: 0,
        total: 0,
      },
      latency: Date.now() - startTime,
      usageInfo: {
        allowed: false,
        reason: usageCheck.reason,
        tokensUsed: 0,
        costIncurred: 0,
        remainingToday: {
          requests: usageCheck.limits.requestsPerDay - usageCheck.current.requestsToday,
          tokens: usageCheck.limits.tokensPerDay - usageCheck.current.tokensToday,
          cost: usageCheck.limits.costPerDay - usageCheck.current.costToday,
        },
      },
    };
    
    throw new Error(usageCheck.reason);
  }

  // Step 4: Send request
  let aiResponse: AIResponse;
  let success = true;
  let error: string | undefined;

  try {
    aiResponse = await sendAIRequest(request);
  } catch (err: any) {
    success = false;
    error = err.message;
    throw err;
  } finally {
    // Step 5: Track usage (even on failure)
    await trackUsage({
      userId: request.userId,
      sessionId: request.sessionId,
      timestamp: new Date(),
      provider: request.model.split('-')[0], // Extract provider from model name
      model: request.model,
      promptTokens: aiResponse?.parsed.metadata?.tokens?.input || 0,
      completionTokens: aiResponse?.parsed.metadata?.tokens?.output || 0,
      totalTokens: aiResponse?.parsed.metadata?.tokens?.total || 0,
      cost: aiResponse?.cost.total || 0,
      latency: aiResponse?.latency || (Date.now() - startTime),
      endpoint: '/api/chat',
      success,
      error,
    });
  }

  // Step 6: Calculate remaining usage
  const updatedCheck = await checkUsageLimits(
    request.userId,
    request.userTier || 'free'
  );

  return {
    ...aiResponse,
    usageInfo: {
      allowed: true,
      tokensUsed: aiResponse.parsed.metadata?.tokens?.total || 0,
      costIncurred: aiResponse.cost.total,
      remainingToday: {
        requests: updatedCheck.limits.requestsPerDay - updatedCheck.current.requestsToday,
        tokens: updatedCheck.limits.tokensPerDay - updatedCheck.current.tokensToday,
        cost: updatedCheck.limits.costPerDay - updatedCheck.current.costToday,
      },
    },
  };
}

/**
 * Validate prompt before sending (for UI feedback)
 */
export async function validatePrompt(prompt: string): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}> {
  const result = await checkFirewall(prompt);
  
  if (!result.allowed) {
    return {
      valid: false,
      errors: [result.reason || 'Prompt validation failed'],
      warnings: [],
      suggestions: result.suggestions || [],
    };
  }

  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check prompt length
  if (prompt.length < 10) {
    warnings.push('Prompt is very short. Consider adding more context.');
  }

  if (prompt.length > 5000) {
    warnings.push('Prompt is quite long. Consider breaking it into smaller parts.');
  }

  // Check for best practices
  if (!prompt.includes('?') && !prompt.includes('.')) {
    suggestions.push('Add clear instructions or questions to your prompt.');
  }

  return {
    valid: true,
    errors: [],
    warnings,
    suggestions,
  };
}
