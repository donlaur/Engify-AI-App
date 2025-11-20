/**
 * Single Content Generation API
 * Generates one piece of content at a time from queue
 */

import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';
import { ContentGeneratorFactory } from '@/lib/factories/ContentGeneratorFactory';
import { generatedContentService } from '@/lib/services/GeneratedContentService';
import { ContentQueueService } from '@/lib/services/ContentQueueService';
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
  const startTime = Date.now();
  
  try {
    console.log(`[${params.jobId}] Starting generation for: ${params.title}`);

    // Create generator
    const generator = ContentGeneratorFactory.createGenerator('multi-agent', {
      organizationId: 'system',
    });

    // Generate content
    const result = await generator.generate({
      topic: params.title,
      category: params.contentType,
      targetWordCount: params.targetWordCount,
      keywords: params.keywords,
    });

    const generationTime = Date.now() - startTime;

    console.log(`[${params.jobId}] Generation complete: ${result.metadata.wordCount} words in ${generationTime}ms`);

    // Save to generated_content collection
    const savedContent = await generatedContentService.save({
      queueItemId: params.queueItemId,
      title: params.title,
      content: result.content,
      contentType: params.contentType as any,
      description: `Generated content for: ${params.title}`,
      keywords: params.keywords,
      wordCount: result.metadata.wordCount,
      readingTime: Math.ceil(result.metadata.wordCount / 200),
      model: 'multi-agent',
      costUSD: result.metadata.costUSD,
      generationTimeMs: generationTime,
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

    return savedContent;
  } catch (error) {
    console.error(`[${params.jobId}] Generation failed:`, error);
    
    // Update queue item to failed
    await queueService.updateStatus(params.queueItemId, 'failed');
    await queueService.update(params.queueItemId, {
      generationError: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}
