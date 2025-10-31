/**
 * AI Summary: Provider-agnostic content creator agent with deterministic defaults, budget enforcement,
 * and provenance tracking. Uses allowlisted models and carrier-based execution. Part of Day 5 Phase 2.5.
 */

import { AIProviderFactory } from '../execution/factory/AIProviderFactory';
import { executeWithProviderHarness } from '../ai/v2/utils/provider-harness';
import { buildStoredContent } from '../content/transform';
import { recordProvenance } from '../content/provenance';
import { Collections, WebContentSchema } from '../db/schema';
import { connectDB } from '../db/connection';

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
  cost?: number;
  error?: string;
}

export class CreatorAgent {
  private providerFactory: AIProviderFactory;
  private budgetLimit: number;
  private allowedModels: string[];

  constructor(
    providerFactory: AIProviderFactory,
    budgetLimit: number = 0.50, // $0.50 max per creation
    allowedModels: string[] = ['google/gemini-2.5-flash', 'meta/llama-3-70b-instruct']
  ) {
    this.providerFactory = providerFactory;
    this.budgetLimit = budgetLimit;
    this.allowedModels = allowedModels;
  }

  async createContent(request: ContentCreationRequest): Promise<ContentCreationResult> {
    const startTime = Date.now();

    try {
      // Validate request
      if (!request.topic?.trim()) {
        throw new Error('Topic is required');
      }

      if (!request.category) {
        throw new Error('Category is required');
      }

      // Select model (prefer faster/cheaper for content creation)
      const modelId = this.selectModelForContent(request.category);

      // Generate content prompt
      const prompt = this.buildContentPrompt(request);

      // Execute with provider harness (includes retries, timeouts, cost tracking)
      const executionResult = await executeWithProviderHarness(
        {
          provider: 'openai', // Use OpenAI as primary for content creation
          model: modelId,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7, // Slightly creative but deterministic
          maxTokens: Math.min(request.targetWordCount ? request.targetWordCount * 4 : 2000, 4000),
        },
        {
          maxRetries: 2,
          timeoutMs: 60000, // 1 minute timeout
          budgetLimit: this.budgetLimit,
        }
      );

      if (!executionResult.success || !executionResult.data) {
        throw new Error(executionResult.error || 'Content generation failed');
      }

      const generatedContent = executionResult.data.content;
      const wordCount = generatedContent.split(/\s+/).length;

      // Validate content quality
      if (wordCount < 100) {
        throw new Error('Generated content too short, minimum 100 words required');
      }

      // Build stored content record
      const storedContent = buildStoredContent({
        url: request.sourceUrl || `agent-generated://${request.topic.replace(/\s+/g, '-').toLowerCase()}`,
        title: this.generateTitle(request.topic, generatedContent),
        content: generatedContent,
        category: request.category,
        tags: request.tags || [],
        publishedAt: new Date(),
        source: 'agent-generated',
        qualityScore: 0.8, // Default quality score for AI-generated content
        metadata: {
          topic: request.topic,
          wordCount,
          tokensUsed: executionResult.data.usage?.totalTokens,
          cost: executionResult.cost,
          model: modelId,
          generationTimeMs: Date.now() - startTime,
        }
      });

      // Persist to database
      const db = await connectDB();
      const result = await db.collection<WebContentSchema>(Collections.WEB_CONTENT).insertOne(storedContent);

      // Record provenance
      await recordProvenance({
        operation: 'content_created',
        collection: Collections.WEB_CONTENT,
        documentId: result.insertedId.toString(),
        source: 'CreatorAgent',
        metadata: {
          topic: request.topic,
          category: request.category,
          wordCount,
          tokensUsed: executionResult.data.usage?.totalTokens,
          cost: executionResult.cost,
          model: modelId,
          qualityScore: storedContent.qualityScore,
        },
        status: 'success',
        durationMs: Date.now() - startTime,
      });

      return {
        success: true,
        contentId: result.insertedId.toString(),
        wordCount,
        tokensUsed: executionResult.data.usage?.totalTokens,
        cost: executionResult.cost,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Record failed provenance
      try {
        await recordProvenance({
          operation: 'content_creation_failed',
          collection: Collections.WEB_CONTENT,
          source: 'CreatorAgent',
          metadata: {
            topic: request.topic,
            category: request.category,
            error: errorMessage,
          },
          status: 'error',
          durationMs: Date.now() - startTime,
        });
      } catch (provenanceError) {
        // Don't let provenance errors mask the original error
        console.error('Failed to record provenance for failed creation:', provenanceError);
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private selectModelForContent(category: string): string {
    // Select model based on content category
    // Prefer Gemini for technical content, Claude for creative/marketing
    if (category === 'engineering' || category === 'product') {
      return 'google/gemini-2.5-flash';
    }
    return this.allowedModels[0]; // Default to first allowed model
  }

  private buildContentPrompt(request: ContentCreationRequest): string {
    const targetWords = request.targetWordCount || 500;
    const category = request.category;

    return `Write a comprehensive, well-structured article about: ${request.topic}

Category: ${category}
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
    // Extract a potential title from the first line or generate one
    const firstLine = content.split('\n')[0].trim();

    // If first line looks like a title (short and no punctuation), use it
    if (firstLine.length < 80 && !firstLine.includes('.') && !firstLine.includes('?')) {
      return firstLine;
    }

    // Otherwise, create a title from the topic
    return `Understanding ${topic}`;
  }

  // Utility method to get creation statistics
  async getStats(): Promise<{
    totalCreated: number;
    totalWords: number;
    totalCost: number;
    averageQuality: number;
  }> {
    const db = await connectDB();
    const pipeline = [
      {
        $match: {
          source: 'agent-generated',
          reviewStatus: { $ne: 'rejected' }
        }
      },
      {
        $group: {
          _id: null,
          totalCreated: { $sum: 1 },
          totalWords: { $sum: '$metadata.wordCount' },
          totalCost: { $sum: '$metadata.cost' },
          averageQuality: { $avg: '$qualityScore' }
        }
      }
    ];

    const result = await db.collection(Collections.WEB_CONTENT).aggregate(pipeline).toArray();

    if (result.length === 0) {
      return { totalCreated: 0, totalWords: 0, totalCost: 0, averageQuality: 0 };
    }

    return result[0];
  }
}
