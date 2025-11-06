/**
 * OpenAI Model Data Tracker
 * 
 * Extracts and structures model data from OpenAI documentation pages
 * to populate our database with OpenAI-style metadata
 * 
 * This script helps track variations in:
 * - Pricing models (per token vs per second for video)
 * - Performance metrics (reasoning, speed indicators)
 * - Modalities support (input/output specifications)
 * - Tools support (varies by model)
 * - Rate limits (different tiers have different limits)
 */

// Data extracted from OpenAI documentation pages
export const OPENAI_MODEL_DATA: Record<string, {
  id: string;
  displayName: string;
  codename?: string;
  tagline: string;
  description: string;
  isDefault?: boolean;
  performanceMetrics: {
    reasoning: 'lower' | 'low' | 'medium' | 'high' | 'higher';
    speed: 'slower' | 'slow' | 'medium' | 'fast' | 'faster';
    priceRange: string;
  };
  knowledgeCutoff: string;
  pricing: {
    // Token-based pricing (for text models)
    costPer1kInputTokens?: number;
    costPer1kCachedInputTokens?: number;
    costPer1kOutputTokens?: number;
    // Per-second pricing (for video/audio models)
    costPerSecond?: number;
    pricingUnit?: 'tokens' | 'seconds';
    pricingNotes?: string; // e.g., "Portrait: 720x1280 Landscape: 1280x720"
  };
  modalities: {
    text: 'input-output' | 'input-only' | 'output-only' | 'not-supported';
    image: 'input-output' | 'input-only' | 'output-only' | 'not-supported';
    audio: 'input-output' | 'input-only' | 'output-only' | 'not-supported';
    video: 'input-output' | 'input-only' | 'output-only' | 'not-supported';
  };
  features: {
    streaming: boolean;
    structuredOutputs: boolean;
    distillation: boolean;
    functionCalling: boolean;
    fineTuning: boolean;
  };
  tools: {
    webSearch: boolean;
    imageGeneration: boolean;
    computerUse: boolean;
    fileSearch: boolean;
    codeInterpreter: boolean;
    mcp: boolean;
  };
  endpoints: Array<{
    name: string;
    path: string;
    supported: boolean;
  }>;
  snapshots: Array<{
    id: string;
    pointsTo: string;
    isAlias: boolean;
    isSnapshot: boolean;
  }>;
  rateLimits: Array<{
    tier: string;
    rpm?: number;
    tpm?: number;
    batchQueueLimit?: number;
  }>;
}> = {
  'gpt-5': {
    id: 'gpt-5',
    displayName: 'GPT-5',
    tagline: 'The best model for coding and agentic tasks across domains.',
    description: 'GPT-5 is our flagship model for coding, reasoning, and agentic tasks across domains.',
    isDefault: true,
    performanceMetrics: {
      reasoning: 'higher',
      speed: 'medium',
      priceRange: '$1.25 - $10',
    },
    knowledgeCutoff: 'Sep 30, 2024',
    pricing: {
      costPer1kInputTokens: 1.25 / 1000, // $1.25 per 1M
      costPer1kCachedInputTokens: 0.125 / 1000, // $0.125 per 1M
      costPer1kOutputTokens: 10.00 / 1000, // $10 per 1M
      pricingUnit: 'tokens',
    },
    modalities: {
      text: 'input-output',
      image: 'input-only',
      audio: 'not-supported',
      video: 'not-supported',
    },
    features: {
      streaming: true,
      structuredOutputs: true,
      distillation: true,
      functionCalling: true,
      fineTuning: false,
    },
    tools: {
      webSearch: true,
      imageGeneration: false,
      computerUse: false,
      fileSearch: true,
      codeInterpreter: true,
      mcp: true,
    },
    endpoints: [
      { name: 'Chat Completions', path: 'v1/chat/completions', supported: true },
      { name: 'Responses', path: 'v1/responses', supported: true },
      { name: 'Realtime', path: 'v1/realtime', supported: true },
      { name: 'Assistants', path: 'v1/assistants', supported: true },
      { name: 'Batch', path: 'v1/batch', supported: true },
      { name: 'Fine-tuning', path: 'v1/fine-tuning', supported: false },
      { name: 'Embeddings', path: 'v1/embeddings', supported: false },
      { name: 'Image generation', path: 'v1/images/generations', supported: false },
      { name: 'Videos', path: 'v1/videos', supported: false },
      { name: 'Image edit', path: 'v1/images/edits', supported: false },
      { name: 'Speech generation', path: 'v1/audio/speech', supported: false },
      { name: 'Transcription', path: 'v1/audio/transcriptions', supported: false },
      { name: 'Translation', path: 'v1/audio/translations', supported: false },
      { name: 'Moderation', path: 'v1/moderations', supported: false },
      { name: 'Completions (legacy)', path: 'v1/completions', supported: false },
    ],
    snapshots: [
      { id: 'gpt-5', pointsTo: 'gpt-5-2025-08-07', isAlias: true, isSnapshot: false },
      { id: 'gpt-5-2025-08-07', pointsTo: 'gpt-5-2025-08-07', isAlias: false, isSnapshot: true },
    ],
    rateLimits: [
      { tier: 'Free', rpm: undefined, tpm: undefined, batchQueueLimit: undefined },
      { tier: 'Tier 1', rpm: 500, tpm: 500000, batchQueueLimit: 1500000 },
      { tier: 'Tier 2', rpm: 5000, tpm: 1000000, batchQueueLimit: 3000000 },
      { tier: 'Tier 3', rpm: 5000, tpm: 2000000, batchQueueLimit: 100000000 },
      { tier: 'Tier 4', rpm: 10000, tpm: 4000000, batchQueueLimit: 200000000 },
      { tier: 'Tier 5', rpm: 15000, tpm: 40000000, batchQueueLimit: 15000000000 },
    ],
  },
  'gpt-5-mini': {
    id: 'gpt-5-mini',
    displayName: 'GPT-5 mini',
    codename: 'mini',
    tagline: 'A faster, cost-efficient version of GPT-5 for well-defined tasks',
    description: 'GPT-5 mini is a faster, more cost-efficient version of GPT-5. It\'s great for well-defined tasks and precise prompts.',
    isDefault: true,
    performanceMetrics: {
      reasoning: 'high',
      speed: 'fast',
      priceRange: '$0.25 - $2',
    },
    knowledgeCutoff: 'May 31, 2024',
    pricing: {
      costPer1kInputTokens: 0.25 / 1000, // $0.25 per 1M
      costPer1kCachedInputTokens: 0.025 / 1000, // $0.025 per 1M
      costPer1kOutputTokens: 2.00 / 1000, // $2 per 1M
      pricingUnit: 'tokens',
    },
    modalities: {
      text: 'input-output',
      image: 'input-only',
      audio: 'not-supported',
      video: 'not-supported',
    },
    features: {
      streaming: true,
      structuredOutputs: true,
      distillation: false,
      functionCalling: true,
      fineTuning: false,
    },
    tools: {
      webSearch: true,
      imageGeneration: false,
      computerUse: false,
      fileSearch: true,
      codeInterpreter: true,
      mcp: true,
    },
    endpoints: [
      { name: 'Chat Completions', path: 'v1/chat/completions', supported: true },
      { name: 'Responses', path: 'v1/responses', supported: true },
      { name: 'Realtime', path: 'v1/realtime', supported: true },
      { name: 'Assistants', path: 'v1/assistants', supported: true },
      { name: 'Batch', path: 'v1/batch', supported: true },
      { name: 'Fine-tuning', path: 'v1/fine-tuning', supported: false },
      { name: 'Embeddings', path: 'v1/embeddings', supported: false },
      { name: 'Image generation', path: 'v1/images/generations', supported: false },
      { name: 'Videos', path: 'v1/videos', supported: false },
      { name: 'Image edit', path: 'v1/images/edits', supported: false },
      { name: 'Speech generation', path: 'v1/audio/speech', supported: false },
      { name: 'Transcription', path: 'v1/audio/transcriptions', supported: false },
      { name: 'Translation', path: 'v1/audio/translations', supported: false },
      { name: 'Moderation', path: 'v1/moderations', supported: false },
      { name: 'Completions (legacy)', path: 'v1/completions', supported: false },
    ],
    snapshots: [
      { id: 'gpt-5-mini', pointsTo: 'gpt-5-mini-2025-08-07', isAlias: true, isSnapshot: false },
      { id: 'gpt-5-mini-2025-08-07', pointsTo: 'gpt-5-mini-2025-08-07', isAlias: false, isSnapshot: true },
    ],
    rateLimits: [
      { tier: 'Free', rpm: undefined, tpm: undefined, batchQueueLimit: undefined },
      { tier: 'Tier 1', rpm: 500, tpm: 500000, batchQueueLimit: 5000000 },
      { tier: 'Tier 2', rpm: 5000, tpm: 2000000, batchQueueLimit: 20000000 },
      { tier: 'Tier 3', rpm: 5000, tpm: 4000000, batchQueueLimit: 40000000 },
      { tier: 'Tier 4', rpm: 10000, tpm: 10000000, batchQueueLimit: 1000000000 },
      { tier: 'Tier 5', rpm: 30000, tpm: 180000000, batchQueueLimit: 15000000000 },
    ],
  },
  'gpt-5-nano': {
    id: 'gpt-5-nano',
    displayName: 'GPT-5 nano',
    codename: 'nano',
    tagline: 'Fastest, most cost-efficient version of GPT-5',
    description: 'GPT-5 Nano is our fastest, cheapest version of GPT-5. It\'s great for summarization and classification tasks.',
    isDefault: true,
    performanceMetrics: {
      reasoning: 'medium',
      speed: 'faster',
      priceRange: '$0.05 - $0.4',
    },
    knowledgeCutoff: 'May 31, 2024',
    pricing: {
      costPer1kInputTokens: 0.05 / 1000, // $0.05 per 1M
      costPer1kCachedInputTokens: 0.005 / 1000, // $0.005 per 1M
      costPer1kOutputTokens: 0.40 / 1000, // $0.40 per 1M
      pricingUnit: 'tokens',
    },
    modalities: {
      text: 'input-output',
      image: 'input-only',
      audio: 'not-supported',
      video: 'not-supported',
    },
    features: {
      streaming: true,
      structuredOutputs: true,
      distillation: false,
      functionCalling: true,
      fineTuning: false,
    },
    tools: {
      webSearch: false, // Different from mini!
      imageGeneration: true, // Different from mini!
      computerUse: false,
      fileSearch: true,
      codeInterpreter: true,
      mcp: true,
    },
    endpoints: [
      { name: 'Chat Completions', path: 'v1/chat/completions', supported: true },
      { name: 'Responses', path: 'v1/responses', supported: true },
      { name: 'Realtime', path: 'v1/realtime', supported: true },
      { name: 'Assistants', path: 'v1/assistants', supported: true },
      { name: 'Batch', path: 'v1/batch', supported: true },
      { name: 'Fine-tuning', path: 'v1/fine-tuning', supported: false },
      { name: 'Embeddings', path: 'v1/embeddings', supported: false },
      { name: 'Image generation', path: 'v1/images/generations', supported: false },
      { name: 'Videos', path: 'v1/videos', supported: false },
      { name: 'Image edit', path: 'v1/images/edits', supported: false },
      { name: 'Speech generation', path: 'v1/audio/speech', supported: false },
      { name: 'Transcription', path: 'v1/audio/transcriptions', supported: false },
      { name: 'Translation', path: 'v1/audio/translations', supported: false },
      { name: 'Moderation', path: 'v1/moderations', supported: false },
      { name: 'Completions (legacy)', path: 'v1/completions', supported: false },
    ],
    snapshots: [
      { id: 'gpt-5-nano', pointsTo: 'gpt-5-nano-2025-08-07', isAlias: true, isSnapshot: false },
      { id: 'gpt-5-nano-2025-08-07', pointsTo: 'gpt-5-nano-2025-08-07', isAlias: false, isSnapshot: true },
    ],
    rateLimits: [
      { tier: 'Free', rpm: undefined, tpm: undefined, batchQueueLimit: undefined },
      { tier: 'Tier 1', rpm: 500, tpm: 200000, batchQueueLimit: 2000000 },
      { tier: 'Tier 2', rpm: 5000, tpm: 2000000, batchQueueLimit: 20000000 },
      { tier: 'Tier 3', rpm: 5000, tpm: 4000000, batchQueueLimit: 40000000 },
      { tier: 'Tier 4', rpm: 10000, tpm: 10000000, batchQueueLimit: 1000000000 },
      { tier: 'Tier 5', rpm: 30000, tpm: 180000000, batchQueueLimit: 15000000000 },
    ],
  },
  'sora-2': {
    id: 'sora-2',
    displayName: 'Sora 2',
    codename: 'sora',
    tagline: 'Flagship video generation with synced audio',
    description: 'Sora 2 is our new powerful media generation model, generating videos with synced audio. It can create richly detailed, dynamic clips from natural language or images.',
    isDefault: true,
    performanceMetrics: {
      reasoning: 'higher',
      speed: 'slow',
      priceRange: '$0.10',
    },
    knowledgeCutoff: '', // Video models don't have knowledge cutoff
    pricing: {
      costPerSecond: 0.10, // $0.10 per second
      pricingUnit: 'seconds',
      pricingNotes: 'Portrait: 720x1280 Landscape: 1280x720',
    },
    modalities: {
      text: 'input-only',
      image: 'input-only',
      audio: 'output-only',
      video: 'output-only',
    },
    features: {
      streaming: false, // Video models typically don't stream
      structuredOutputs: false,
      distillation: false,
      functionCalling: false,
      fineTuning: false,
    },
    tools: {
      webSearch: false,
      imageGeneration: false,
      computerUse: false,
      fileSearch: false,
      codeInterpreter: false,
      mcp: false,
    },
    endpoints: [
      { name: 'Videos', path: 'v1/videos', supported: true },
      { name: 'Chat Completions', path: 'v1/chat/completions', supported: false },
      { name: 'Responses', path: 'v1/responses', supported: false },
      { name: 'Realtime', path: 'v1/realtime', supported: false },
      { name: 'Assistants', path: 'v1/assistants', supported: false },
      { name: 'Batch', path: 'v1/batch', supported: false },
      { name: 'Fine-tuning', path: 'v1/fine-tuning', supported: false },
      { name: 'Embeddings', path: 'v1/embeddings', supported: false },
      { name: 'Image generation', path: 'v1/images/generations', supported: false },
      { name: 'Image edit', path: 'v1/images/edits', supported: false },
      { name: 'Speech generation', path: 'v1/audio/speech', supported: false },
      { name: 'Transcription', path: 'v1/audio/transcriptions', supported: false },
      { name: 'Translation', path: 'v1/audio/translations', supported: false },
      { name: 'Moderation', path: 'v1/moderations', supported: false },
      { name: 'Completions (legacy)', path: 'v1/completions', supported: false },
    ],
    snapshots: [
      { id: 'sora-2', pointsTo: 'sora-2', isAlias: false, isSnapshot: true },
    ],
    rateLimits: [
      { tier: 'Free', rpm: undefined },
      { tier: 'Tier 1', rpm: 25 },
      { tier: 'Tier 2', rpm: 50 },
      { tier: 'Tier 3', rpm: 125 },
      { tier: 'Tier 4', rpm: 200 },
      { tier: 'Tier 5', rpm: 375 },
    ],
  },
};

/**
 * Helper to convert OpenAI model data to our AIModel schema
 */
export function convertOpenAIDataToModel(
  openaiData: typeof OPENAI_MODEL_DATA[string],
  contextWindow: number = 400000,
  maxOutputTokens: number = 128000,
): Partial<import('@/lib/db/schemas/ai-model').AIModel> {
  return {
    id: openaiData.id,
    name: openaiData.id,
    displayName: openaiData.displayName,
    codename: openaiData.codename,
    isDefault: openaiData.isDefault,
    tagline: openaiData.tagline,
    description: openaiData.description,
    knowledgeCutoff: openaiData.knowledgeCutoff || undefined,
    performanceMetrics: openaiData.performanceMetrics,
    modalities: openaiData.modalities,
    features: openaiData.features,
    tools: openaiData.tools,
    endpoints: openaiData.endpoints,
    snapshots: openaiData.snapshots,
    rateLimits: openaiData.rateLimits,
    contextWindow,
    maxOutputTokens,
    costPer1kInputTokens: openaiData.pricing.costPer1kInputTokens || 0,
    costPer1kCachedInputTokens: openaiData.pricing.costPer1kCachedInputTokens,
    costPer1kOutputTokens: openaiData.pricing.costPer1kOutputTokens || 0,
    inputCostPer1M: openaiData.pricing.costPer1kInputTokens ? openaiData.pricing.costPer1kInputTokens * 1000 : undefined,
    cachedInputCostPer1M: openaiData.pricing.costPer1kCachedInputTokens ? openaiData.pricing.costPer1kCachedInputTokens * 1000 : undefined,
    outputCostPer1M: openaiData.pricing.costPer1kOutputTokens ? openaiData.pricing.costPer1kOutputTokens * 1000 : undefined,
    supportsStreaming: openaiData.features.streaming,
    supportsJSON: openaiData.features.structuredOutputs,
    supportsVision: openaiData.modalities.image !== 'not-supported',
    capabilities: [
      'text',
      ...(openaiData.modalities.image !== 'not-supported' ? ['vision'] : []),
      ...(openaiData.modalities.audio !== 'not-supported' ? ['audio'] : []),
      ...(openaiData.modalities.video !== 'not-supported' ? ['video'] : []),
      ...(openaiData.features.functionCalling ? ['function-calling'] : []),
      ...(openaiData.features.structuredOutputs ? ['json-mode'] : []),
      ...(openaiData.performanceMetrics.reasoning === 'higher' || openaiData.performanceMetrics.reasoning === 'high' ? ['reasoning'] : []),
    ],
    recommended: openaiData.isDefault || false,
    tier: openaiData.pricing.costPer1kInputTokens 
      ? (openaiData.pricing.costPer1kInputTokens < 0.0001 ? 'free' : openaiData.pricing.costPer1kInputTokens < 0.01 ? 'affordable' : 'premium')
      : 'premium',
  };
}

