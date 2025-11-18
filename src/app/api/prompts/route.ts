import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import { RBACPresets } from '@/lib/middleware/rbac';
import { logger } from '@/lib/logging/logger';
import { z } from 'zod';
import { sanitizeText } from '@/lib/security/sanitize';
import { PromptCategorySchema, PromptPatternSchema, CreatePromptSchema } from '@/lib/schemas/prompt';
import { checkPromptDuplicate } from '@/lib/utils/prompt-duplicate-check';
import { seedPrompts } from '@/data/seed-prompts';

// Query parameters validation schema
const PromptsQuerySchema = z.object({
  category: z.union([PromptCategorySchema, z.literal('all')]).optional(),
  pattern: PromptPatternSchema.optional(),
  search: z.string().min(1).max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

/**
 * GET /api/prompts
 * Fetch prompts from MongoDB (or fallback to static data)
 * Public access - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Validate query parameters
    const queryValidation = PromptsQuerySchema.safeParse({
      category: searchParams.get('category'),
      pattern: searchParams.get('pattern'),
      search: searchParams.get('search'),
      limit: searchParams.get('limit'),
      skip: searchParams.get('skip'),
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: queryValidation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { category, pattern, search, limit, skip } = queryValidation.data;

    // Try MongoDB first
    try {
      const db = await getMongoDb();
      const collection = db.collection('prompts');

      // Build query
      const query: Record<string, unknown> = {
        // Only show active prompts on public pages
        active: { $ne: false }, // Include docs without 'active' field (old data) and those with active: true
      };
      if (category && category !== 'all') {
        query.category = category;
      }
      if (pattern) {
        query.pattern = pattern;
      }
      if (search) {
        // Sanitize search query to prevent injection
        const sanitizedSearch = sanitizeText(search);
        query.$text = { $search: sanitizedSearch };
      }

      // Execute query
      const prompts = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await collection.countDocuments(query);

      return NextResponse.json({
        prompts,
        total,
        page: Math.floor(skip / limit) + 1,
        pages: Math.ceil(total / limit),
        source: 'mongodb',
      });
    } catch (dbError) {
      // Fallback to static data
      logger.warn('MongoDB not available, using static data', {
        error: dbError instanceof Error ? dbError.message : 'Unknown error',
      });

      let filtered = seedPrompts;

      if (category && category !== 'all') {
        filtered = filtered.filter((p) => p.category === category);
      }

      if (pattern) {
        filtered = filtered.filter((p) => p.pattern === pattern);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
        );
      }

      const paginated = filtered.slice(skip, skip + limit);

      return NextResponse.json({
        prompts: paginated,
        total: filtered.length,
        page: Math.floor(skip / limit) + 1,
        pages: Math.ceil(filtered.length / limit),
        source: 'static',
      });
    }
  } catch (error) {
    logger.apiError('/api/prompts', error, { method: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/prompts
 * Create a new prompt (requires prompts:write permission)
 */
export async function POST(request: NextRequest) {
  // RBAC: prompts:write permission
  const rbacCheck = await RBACPresets.requirePromptWrite()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const body = await request.json();

    // Validate request body with Zod
    const validation = CreatePromptSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid prompt data',
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    // Sanitize text fields to prevent XSS
    const sanitizedTitle = sanitizeText(validatedData.title);
    const sanitizedDescription = validatedData.description
      ? sanitizeText(validatedData.description)
      : '';
    const sanitizedContent = sanitizeText(validatedData.content);

    // Check for duplicates
    const duplicateCheck = await checkPromptDuplicate({
      title: sanitizedTitle,
      content: sanitizedContent,
      category: validatedData.category,
      role: validatedData.role,
      pattern: validatedData.pattern,
    });

    if (duplicateCheck.isDuplicate) {
      return NextResponse.json(
        {
          error: 'Duplicate prompt detected',
          duplicates: duplicateCheck.matches,
        },
        { status: 409 } // Conflict status code
      );
    }

    const db = await getMongoDb();
    const collection = db.collection('prompts');

    const prompt = {
      ...validatedData,
      title: sanitizedTitle,
      description: sanitizedDescription,
      content: sanitizedContent,
      views: 0,
      favorites: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(prompt);

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
        prompt,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.apiError('/api/prompts', error, { method: 'POST' });
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}
