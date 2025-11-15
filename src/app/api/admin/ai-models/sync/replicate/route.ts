/**
 * Sync Popular Replicate Models
 * 
 * Replicate doesn't have a public API to list all models,
 * so we curate popular models manually. Admins can add more via OpsHub.
 */

import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';
import { auth } from '@/lib/auth';
import { auditLog } from '@/lib/logging/audit';
import { aiModelService } from '@/lib/services/AIModelService';
import { AIModel } from '@/lib/db/schemas/ai-model';
import { generateSlug } from '@/lib/utils/slug';

// Popular Replicate models (as of Nov 2025)
// Source: https://replicate.com/explore
const POPULAR_REPLICATE_MODELS: Array<{
  id: string;
  displayName: string;
  category: 'llm' | 'image' | 'video' | 'audio';
  costPer1kInput?: number;
  costPer1kOutput?: number;
}> = [
  // LLMs - OpenAI Models
  {
    id: 'openai/gpt-5',
    displayName: 'GPT-5',
    category: 'llm',
    costPer1kInput: 0.0025, // Estimated
    costPer1kOutput: 0.01,
  },
  {
    id: 'openai/gpt-5-nano',
    displayName: 'GPT-5 Nano',
    category: 'llm',
    costPer1kInput: 0.001, // Estimated (cheaper than GPT-5)
    costPer1kOutput: 0.004,
  },
  {
    id: 'openai/gpt-4o',
    displayName: 'GPT-4o',
    category: 'llm',
    costPer1kInput: 0.005, // Estimated
    costPer1kOutput: 0.015,
  },
  {
    id: 'openai/gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    category: 'llm',
    costPer1kInput: 0.00015, // Estimated
    costPer1kOutput: 0.0006,
  },
  {
    id: 'openai/gpt-4.1',
    displayName: 'GPT-4.1',
    category: 'llm',
    costPer1kInput: 0.008, // Estimated
    costPer1kOutput: 0.024,
  },
  {
    id: 'openai/gpt-4.1-mini',
    displayName: 'GPT-4.1 Mini',
    category: 'llm',
    costPer1kInput: 0.0002, // Estimated
    costPer1kOutput: 0.0008,
  },
  {
    id: 'openai/gpt-4.1-nano',
    displayName: 'GPT-4.1 Nano',
    category: 'llm',
    costPer1kInput: 0.0001, // Estimated (cheapest)
    costPer1kOutput: 0.0004,
  },
  
  // LLMs - Anthropic Models
  {
    id: 'anthropic/claude-4.5-haiku',
    displayName: 'Claude 4.5 Haiku',
    category: 'llm',
    costPer1kInput: 0.00025,
    costPer1kOutput: 0.00125,
  },
  {
    id: 'anthropic/claude-4-sonnet',
    displayName: 'Claude 4 Sonnet',
    category: 'llm',
    costPer1kInput: 0.003, // Estimated
    costPer1kOutput: 0.015,
  },
  
  // LLMs - Google Models
  {
    id: 'google/gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    category: 'llm',
    costPer1kInput: 0.0025, // $2.50 per million = $0.0025 per 1k
    costPer1kOutput: 0.0025, // $2.50 per million = $0.0025 per 1k
  },
  {
    id: 'google/gemini-2.0-flash-exp',
    displayName: 'Gemini 2.0 Flash Experimental',
    category: 'llm',
    costPer1kInput: 0, // Free during experimental
    costPer1kOutput: 0,
  },
  
  // LLMs - Meta Models
  {
    id: 'meta/llama-3.1-405b-instruct',
    displayName: 'Llama 3.1 405B Instruct',
    category: 'llm',
    costPer1kInput: 0.00059,
    costPer1kOutput: 0.00079,
  },
  
  // Image Generation
  {
    id: 'black-forest-labs/flux-1.1-pro',
    displayName: 'FLUX 1.1 Pro',
    category: 'image',
    costPer1kInput: 0.01, // Per image
    costPer1kOutput: 0,
  },
  {
    id: 'black-forest-labs/flux-schnell',
    displayName: 'FLUX Schnell',
    category: 'image',
    costPer1kInput: 0.003,
    costPer1kOutput: 0,
  },
  {
    id: 'bytedance/seedream-4',
    displayName: 'Seedream 4',
    category: 'image',
    costPer1kInput: 0.015,
    costPer1kOutput: 0,
  },
  {
    id: 'google/imagen-4-fast',
    displayName: 'Imagen 4 Fast',
    category: 'image',
    costPer1kInput: 0.01,
    costPer1kOutput: 0,
  },
  
  // Video Generation
  {
    id: 'openai/sora-2',
    displayName: 'Sora 2',
    category: 'video',
    costPer1kInput: 0.05, // Per second
    costPer1kOutput: 0,
  },
  {
    id: 'google/veo-3.1',
    displayName: 'Veo 3.1',
    category: 'video',
    costPer1kInput: 0.04,
    costPer1kOutput: 0,
  },
];

export async function POST(request: NextRequest) {
  const r = await RBACPresets.requireSuperAdmin()(request);
  if (r) return r;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const aiModels: AIModel[] = POPULAR_REPLICATE_MODELS.map((m) => ({
      id: m.id, // Use owner/model as ID
      slug: generateSlug(m.displayName || m.id), // Generate slug for SEO URLs
      provider: 'replicate' as const,
      name: m.id, // Actual model name for API (owner/model format)
      displayName: m.displayName,
      status: 'active' as const,
      capabilities: m.category === 'llm' ? ['text', 'code'] : 
                   m.category === 'image' ? ['image-generation'] :
                   m.category === 'video' ? ['video-generation'] :
                   ['audio-generation'],
      contextWindow: m.category === 'llm' ? 128000 : 0,
      maxOutputTokens: m.category === 'llm' ? 8192 : undefined,
      costPer1kInputTokens: m.costPer1kInput || 0.01,
      costPer1kOutputTokens: m.costPer1kOutput || 0,
      inputCostPer1M: (m.costPer1kInput || 0.01) * 1000,
      outputCostPer1M: (m.costPer1kOutput || 0) * 1000,
      supportsStreaming: m.category === 'llm',
      supportsJSON: m.category === 'llm',
      supportsVision: m.category === 'image' || m.category === 'video',
      recommended: m.id.includes('gpt-5') || 
                   m.id.includes('claude-4.5') || 
                   m.id.includes('gemini-2.5-flash') || // Latest Gemini model
                   m.id.includes('flux-1.1'),
      tier: m.costPer1kInput === 0 ? 'free' as const : 'affordable' as const,
      isDefault: false,
      isAllowed: true,
      tags: [m.category, 'replicate'],
      parameterFailures: [],
      lastVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: `Popular model from Replicate.com. Category: ${m.category}`,
    } satisfies AIModel));

    const result = await aiModelService.bulkUpsert(aiModels);

    await auditLog({
      userId: session.user.id,
      action: 'admin_action',
      resource: 'ai_models',
      details: { action: 'replicate_models_synced', ...result },
    });

    return NextResponse.json({
      success: true,
      message: 'Replicate models synced successfully',
      ...result,
    });
  } catch (error) {
    console.error('Error syncing Replicate models:', error);
    return NextResponse.json(
      { error: 'Failed to sync Replicate models', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

