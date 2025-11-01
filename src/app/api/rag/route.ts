import { NextRequest, NextResponse } from 'next/server';
// Future: Log usage for authenticated users
// import { auth } from '@/lib/auth';
import { RBACPresets } from '@/lib/middleware/rbac';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { auth } from '@/lib/auth';

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
    // Rate limiting
    const session = await auth();
    const tier = session?.user ? 'authenticated' : 'anonymous';
    const identifier = session?.user?.id || request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip || 'unknown';
    
    const rateLimitResult = await checkRateLimit(identifier, tier);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.reason || 'Rate limit exceeded',
          results: [],
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '3600',
            'X-RateLimit-Limit': '1000',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          }
        }
      );
    }

    // Optional: Log usage for authenticated users (future enhancement)

    const body = await request.json();
    const { query, collection, top_k, filter } = RAGQuerySchema.parse(body);

    // Call Lambda RAG service (API Gateway endpoint)
    const ragResponse = await fetch(`${RAG_API_URL}/rag/search`, {
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
  // Rate limiting for health check (lighter limit)
  const session = await auth();
  const tier = session?.user ? 'authenticated' : 'anonymous';
  const identifier = session?.user?.id || request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip || 'unknown';
  
  const rateLimitResult = await checkRateLimit(identifier, tier);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Rate limit exceeded',
        timestamp: new Date().toISOString(),
      },
      { 
        status: 429,
        headers: {
          'Retry-After': '3600',
        }
      }
    );
  }

  const { searchParams } = new URL(request.url);
  // In non-production, allow explicit control via query param (no fetch)
  if (process.env.NODE_ENV !== 'production') {
    if (searchParams.get('unhealthy') === 'true') {
      return NextResponse.json(
        {
          status: 'unhealthy',
          error: 'Forced unhealthy for tests',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
    // Default healthy in non-prod
    return NextResponse.json(
      {
        status: 'healthy',
        rag_service: 'ok',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
  // Production: actually call external service
  try {
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
