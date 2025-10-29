import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RBACPresets } from '@/lib/middleware/rbac';
import { z } from 'zod';

// RAG API route that integrates with Python FastAPI service
const RAG_API_URL = process.env.RAG_API_URL || 'http://localhost:8000';

const RAGQuerySchema = z.object({
  query: z.string().min(1, 'Query is required'),
  collection: z.string().default('knowledge_base'),
  top_k: z.number().min(1).max(20).default(5),
  filter: z.record(z.any()).optional(),
});

const RAGResponseSchema = z.object({
  results: z.array(
    z.object({
      _id: z.string(),
      title: z.string(),
      content: z.string(),
      score: z.number(),
    })
  ),
  query_embedding: z.array(z.number()),
});

export async function POST(request: NextRequest) {
  // RBAC: workbench:basic permission (RAG is a workbench feature)
  const rbacCheck = await RBACPresets.requireWorkbenchAccess()(request);
  if (rbacCheck) return rbacCheck;

  try {
    // Optional: Log usage for authenticated users (future enhancement)
    const _session = await auth();

    const body = await request.json();
    const { query, collection, top_k, filter } = RAGQuerySchema.parse(body);

    // Call Python RAG service
    const ragResponse = await fetch(`${RAG_API_URL}/api/rag/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        collection,
        top_k,
        filter,
      }),
    });

    if (!ragResponse.ok) {
      throw new Error(`RAG service error: ${ragResponse.status}`);
    }

    const ragData = await ragResponse.json();
    const validatedData = RAGResponseSchema.parse(ragData);

    return NextResponse.json({
      success: true,
      results: validatedData.results,
      query_embedding: validatedData.query_embedding,
      metadata: {
        total_results: validatedData.results.length,
        collection,
        top_k,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('RAG API error:', error);

    // Better error handling based on error type
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          details: error.errors,
          results: [],
        },
        { status: 400 }
      );
    }

    // Check if RAG service is unavailable
    if (
      error instanceof Error &&
      (error.message.includes('fetch failed') ||
        error.message.includes('ECONNREFUSED'))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'RAG service unavailable',
          message:
            'The knowledge base service is currently unavailable. Please try again later.',
          results: [],
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        results: [],
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  try {
    if (
      process.env.NODE_ENV === 'test' ||
      process.env.RAG_TEST_MODE === 'true'
    ) {
      const { searchParams } = new URL(request.url);
      const forceUnhealthy = searchParams.get('unhealthy') === 'true';
      if (forceUnhealthy) {
        return NextResponse.json(
          {
            status: 'unhealthy',
            error: 'Forced unhealthy for tests',
            timestamp: new Date().toISOString(),
          },
          { status: 503 }
        );
      }
      // Default to healthy in tests unless explicitly forced unhealthy
      return NextResponse.json(
        {
          status: 'healthy',
          rag_service: 'ok',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }
    const healthResponse = await fetch(`${RAG_API_URL}/health`);

    if (!healthResponse.ok) {
      throw new Error('RAG service unavailable');
    }

    const healthData = await healthResponse.json();

    return NextResponse.json({
      status: 'healthy',
      rag_service: healthData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
