/**
 * AI Summary: Provider-agnostic content creator agent with deterministic defaults, budget enforcement,
 * and provenance tracking. Uses allowlisted models and carrier-based execution. Part of Day 5 Phase 2.5.
 */

import { AIProviderFactory } from '@/lib/ai/v2/factory/AIProviderFactory';
import type { AIRequest } from '@/lib/ai/v2/interfaces/AIProvider';
import type { OptionalUnlessRequiredId } from 'mongodb';
import { buildStoredContent } from '@/lib/content/transform';
import { recordProvenance } from '@/lib/content/provenance';
import { Collections, type WebContent } from '@/lib/db/schema';
import { getDb } from '@/lib/db/client';
import { countWords } from '@/lib/content/quality';
import { logger } from '@/lib/logging/logger';

export interface ContentCreationRequest {
  topic: string;
  category: string;
  targetWordCount?: number;
  tags?: string[];
  sourceUrl?: string;
}

export interface ContentCreationResult {
  success: boolean;
  contentId?: string;
  wordCount?: number;
  tokensUsed?: number;
  costUSD?: number;
  error?: string;
}

type ProviderFactory = Pick<
  typeof AIProviderFactory,
  'create' | 'getAvailableProviders'
>;

const DEFAULT_BUDGET_LIMIT = Number(
  process.env.CONTENT_CREATION_BUDGET_LIMIT ?? '0.5'
);
const DEFAULT_ALLOWED = ['openai-gpt4-turbo', 'openai', 'gemini-flash', 'claude-sonnet'];
const MIN_WORD_THRESHOLD = Number(process.env.CONTENT_CREATION_MIN_WORDS ?? '100');

function sanitizeAllowedProviders(
  rawList: string | undefined,
  available: string[]
): string[] {
  const parsed = (rawList || '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  const allowlist = parsed.length > 0 ? parsed : DEFAULT_ALLOWED;
  const set = new Set(available);
  const filtered = allowlist.filter((provider) => set.has(provider));

  if (filtered.length > 0) {
    return filtered;
  }

  // Fallback to any available provider if env configuration is invalid
  return available.slice(0, 1);
}

export class CreatorAgent {
  private readonly budgetLimit: number;
  private readonly allowedProviders: string[];

  constructor(
    private readonly providerFactory: ProviderFactory = AIProviderFactory,
    budgetLimit?: number,
    allowedProviders?: string[]
  ) {
    const availableProviders = providerFactory.getAvailableProviders();

    this.budgetLimit =
      budgetLimit ?? (Number.isFinite(DEFAULT_BUDGET_LIMIT) ? DEFAULT_BUDGET_LIMIT : 0.5);

    const configuredAllowed = allowedProviders ?? sanitizeAllowedProviders(
      process.env.CONTENT_CREATION_ALLOWED_MODELS,
      availableProviders
    );

    this.allowedProviders = configuredAllowed.length
      ? configuredAllowed
      : sanitizeAllowedProviders(undefined, availableProviders);
  }

  async createContent(
    request: ContentCreationRequest
  ): Promise<ContentCreationResult> {
    const startedAt = Date.now();

    try {
      this.validateRequest(request);

      const providerKey = this.selectProviderForCategory(request.category);
      const provider = this.providerFactory.create(providerKey);
      const aiRequest = this.buildAIRequest(request);

      if (!provider.validateRequest(aiRequest)) {
        throw new Error('Content request failed provider validation');
      }

      const response = await provider.execute(aiRequest);
      const generated = response.content?.trim() ?? '';
      const wordCount = countWords(generated);

      if (wordCount < MIN_WORD_THRESHOLD) {
        throw new Error(
          `Generated content too short (${wordCount} words). Minimum is ${MIN_WORD_THRESHOLD}.`
        );
      }

      const totalCost = response.cost?.total ?? 0;
      if (totalCost > this.budgetLimit) {
        throw new Error(
          `Content generation cost ${totalCost.toFixed(4)} exceeds budget limit ${this.budgetLimit.toFixed(4)}.`
        );
      }

      const storedContent = buildStoredContent({
        text: generated,
        title: this.generateTitle(request.topic, generated),
        description: this.buildDescription(generated),
        url:
          request.sourceUrl ??
          `agent-generated://${request.topic.replace(/\s+/g, '-').toLowerCase()}`,
        source: 'agent-generated',
        metadata: {
          topic: request.topic,
          category: request.category,
          tags: request.tags ?? [],
          provider: response.provider,
          model: response.model,
          wordCount,
          tokensUsed: response.usage?.totalTokens ?? 0,
          costUSD: totalCost,
          latencyMs: response.latency,
          targetWordCount: request.targetWordCount ?? null,
          qualityScore: this.computeQualityScore(
            wordCount,
            request.targetWordCount
          ),
        },
      });

      if (!storedContent) {
        throw new Error('Generated content failed persistence quality checks');
      }

      const db = await getDb();
      const collection = db.collection<OptionalUnlessRequiredId<WebContent>>(
        Collections.WEB_CONTENT
      );
      const insertResult = await collection.insertOne(
        storedContent as OptionalUnlessRequiredId<WebContent>
      );

      await recordProvenance({
        stage: 'creator_agent.create',
        source: 'CreatorAgent',
        status: 'success',
        metadata: {
          contentId: insertResult.insertedId.toString(),
          topic: request.topic,
          category: request.category,
          provider: response.provider,
          model: response.model,
          costUSD: totalCost,
          wordCount,
          latencyMs: response.latency,
          durationMs: Date.now() - startedAt,
        },
      });

      return {
        success: true,
        contentId: insertResult.insertedId.toString(),
        wordCount,
        tokensUsed: response.usage?.totalTokens ?? 0,
        costUSD: totalCost,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      logger.error('creator-agent.create.error', {
        error: message,
        topic: request.topic,
        category: request.category,
      });

      await this.safeRecordFailureProvenance(request, message, startedAt);

      return {
        success: false,
        error: message,
      };
    }
  }

  async getStats(): Promise<{
    totalCreated: number;
    totalWords: number;
    totalCost: number;
    averageQuality: number;
  }> {
    const db = await getDb();
    const collection = db.collection<WebContent>(Collections.WEB_CONTENT);

    const documents = await collection
      .find({ source: 'agent-generated', reviewStatus: { $ne: 'rejected' } })
      .project({ metadata: 1 })
      .toArray();

    if (documents.length === 0) {
      return {
        totalCreated: 0,
        totalWords: 0,
        totalCost: 0,
        averageQuality: 0,
      };
    }

    const totals = documents.reduce(
      (acc, doc) => {
        const metadata = (doc as WebContent).metadata as Record<string, unknown> | undefined;
        const wordCount = Number(metadata?.wordCount ?? 0);
        const costUSD = Number(metadata?.costUSD ?? 0);
        const qualityScore = Number(metadata?.qualityScore ?? 0);

        acc.totalWords += Number.isFinite(wordCount) ? wordCount : 0;
        acc.totalCost += Number.isFinite(costUSD) ? costUSD : 0;
        acc.qualitySum += Number.isFinite(qualityScore) ? qualityScore : 0;
        return acc;
      },
      { totalWords: 0, totalCost: 0, qualitySum: 0 }
    );

    return {
      totalCreated: documents.length,
      totalWords: totals.totalWords,
      totalCost: totals.totalCost,
      averageQuality:
        documents.length > 0 ? totals.qualitySum / documents.length : 0,
    };
  }

  private validateRequest(request: ContentCreationRequest): void {
    if (!request.topic || request.topic.trim().length < 3) {
      throw new Error('Topic is required and must be at least 3 characters');
    }

    if (!request.category) {
      throw new Error('Category is required');
    }

    if (request.targetWordCount && request.targetWordCount < MIN_WORD_THRESHOLD) {
      throw new Error(
        `Target word count must be at least ${MIN_WORD_THRESHOLD} when specified`
      );
    }
  }

  private selectProviderForCategory(category: string): string {
    const preferenceMap: Record<string, string[]> = {
      engineering: ['openai-gpt4-turbo', 'openai', 'gemini-flash', 'claude-sonnet'],
      product: ['claude-sonnet', 'openai', 'gemini-flash'],
      marketing: ['gemini-flash', 'claude-haiku', 'openai'],
      sales: ['openai', 'claude-sonnet'],
      support: ['openai', 'gemini-flash'],
      design: ['claude-haiku', 'openai'],
    };

    const preferences = preferenceMap[category] ?? this.allowedProviders;
    for (const candidate of preferences) {
      if (this.allowedProviders.includes(candidate)) {
        return candidate;
      }
    }

    return this.allowedProviders[0];
  }

  private buildAIRequest(request: ContentCreationRequest): AIRequest {
    const targetWordCount = request.targetWordCount ?? 600;
    const prompt = this.buildContentPrompt(request, targetWordCount);

    return {
      prompt,
      temperature: 0.7,
      maxTokens: Math.min(targetWordCount * 4, 4000),
    };
  }

  private buildContentPrompt(
    request: ContentCreationRequest,
    targetWords: number
  ): string {
    return `Write a comprehensive, well-structured article about: ${request.topic}

Category: ${request.category}
Target word count: ${targetWords} words
Style: Professional, informative, and engaging

Requirements:
- Start with a compelling introduction
- Include relevant facts, examples, and analysis
- Use clear headings and subheadings for structure
- End with a conclusion or key takeaways
- Write in natural, conversational language
- Ensure the content is original and valuable

Topic: ${request.topic}

Please write the complete article below:`;
  }

  private generateTitle(topic: string, content: string): string {
    const firstLine = content.split('\n')[0]?.trim() ?? '';

    if (
      firstLine.length > 0 &&
      firstLine.length < 80 &&
      !firstLine.includes('.') &&
      !firstLine.includes('?')
    ) {
      return firstLine;
    }

    return `Understanding ${topic}`;
  }

  private buildDescription(content: string): string | null {
    const sentences = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (sentences.length === 0) {
      return null;
    }

    const preview = sentences.slice(0, 2).join(' ');
    return preview.slice(0, 240);
  }

  private computeQualityScore(
    wordCount: number,
    targetWordCount?: number
  ): number {
    const target = targetWordCount ?? 600;
    if (target <= 0) {
      return 0.8;
    }

    const ratio = wordCount / target;
    const score = Math.min(1, Math.max(0.6, ratio));
    return Number(score.toFixed(2));
  }

  private async safeRecordFailureProvenance(
    request: ContentCreationRequest,
    errorMessage: string,
    startedAt: number
  ): Promise<void> {
    try {
      await recordProvenance({
        stage: 'creator_agent.create',
        source: 'CreatorAgent',
        status: 'error',
        metadata: {
          topic: request.topic,
          category: request.category,
          error: errorMessage,
          durationMs: Date.now() - startedAt,
        },
      });
    } catch (provenanceError) {
      logger.error('creator-agent.provenance.error', {
        error:
          provenanceError instanceof Error
            ? provenanceError.message
            : String(provenanceError),
      });
    }
  }
}
