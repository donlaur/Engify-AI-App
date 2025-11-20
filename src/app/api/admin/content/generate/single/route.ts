/**
 * Single Content Generation API
 * Generates one piece of content at a time from queue
 */

import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';
import { generatedContentService } from '@/lib/services/GeneratedContentService';
import { ContentQueueService } from '@/lib/services/ContentQueueService';
import { ChunkedContentGenerator } from '@/lib/services/content/ChunkedContentGenerator';
import { ProgressCache } from '@/lib/services/content/ProgressCache';
import { ObjectId } from 'mongodb';

const queueService = new ContentQueueService();

export async function POST(request: NextRequest) {
  const r = await RBACPresets.requireOrgAdmin()(request);
  if (r) return r;

  try {
    const body = await request.json();
    const { queueItemId, title, contentType, targetWordCount, keywords } = body;

    if (!queueItemId || !title || !contentType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update queue item status to generating
    await queueService.updateStatus(queueItemId, 'generating');

    // Generate job ID
    const jobId = new ObjectId().toString();

    // Start generation in background (don't await)
    generateContent({
      jobId,
      queueItemId,
      title,
      contentType,
      targetWordCount: targetWordCount || 2000,
      keywords: keywords || [],
    }).catch(error => {
      console.error('Generation failed:', error);
      queueService.updateStatus(queueItemId, 'failed');
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Generation started',
    });
  } catch (error) {
    console.error('Error starting generation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to start generation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Background generation function
 */
async function generateContent(params: {
  jobId: string;
  queueItemId: string;
  title: string;
  contentType: string;
  targetWordCount: number;
  keywords: string[];
}) {
  const progressCache = new ProgressCache();
  
  try {
    console.log(`[${params.jobId}] Starting generation for: ${params.title}`);

    // Create chunked generator with progress tracking
    const generator = new ChunkedContentGenerator({
      provider: 'openai',
      model: 'gpt-4o-2024-11-20', // Latest model (gpt-4o-mini deprecated Dec 2024)
      jobId: params.jobId,
      progressCache,
    });

    // Generate content in sections
    const result = await generator.generate({
      topic: params.title,
      contentType: params.contentType,
      targetWordCount: params.targetWordCount,
      keywords: params.keywords,
    });

    console.log(`[${params.jobId}] Generation complete: ${result.metadata.totalWordCount} words in ${result.metadata.generationTimeMs}ms`);

    // Save to generated_content collection
    const savedContent = await generatedContentService.save({
      queueItemId: params.queueItemId,
      title: params.title,
      content: result.fullContent,
      contentType: params.contentType as any,
      description: `Generated content for: ${params.title}`,
      keywords: params.keywords,
      wordCount: result.metadata.totalWordCount,
      readingTime: Math.ceil(result.metadata.totalWordCount / 200),
      model: 'gpt-4o-2024-11-20-chunked',
      costUSD: result.metadata.costUSD,
      generationTimeMs: result.metadata.generationTimeMs,
      status: 'pending',
      createdBy: 'system',
    });

    console.log(`[${params.jobId}] Saved to DB: ${savedContent.id}`);

    // Update queue item
    await queueService.updateStatus(params.queueItemId, 'completed');
    await queueService.update(params.queueItemId, {
      generatedContentId: savedContent.id,
      generationJobId: params.jobId,
      generatedAt: new Date(),
    });

    console.log(`[${params.jobId}] Queue item updated`);

    // Mark progress as complete
    await progressCache.complete(params.jobId);
    await progressCache.close();

    return savedContent;
  } catch (error) {
    console.error(`[${params.jobId}] Generation failed:`, error);
    
    // Mark progress as failed
    await progressCache.fail(
      params.jobId,
      error instanceof Error ? error.message : 'Unknown error'
    );
    await progressCache.close();
    
    await queueService.updateStatus(params.queueItemId, 'failed');
    await queueService.update(params.queueItemId, {
      generationError: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}
