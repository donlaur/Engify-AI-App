import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';

/**
 * GET /api/prompts
 * Fetch prompts from MongoDB (or fallback to static data)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Try MongoDB first
    try {
      const db = await getMongoDb();
      const collection = db.collection('prompts');

      // Build query
      const query: any = {};
      if (category && category !== 'all') {
        query.category = category;
      }
      if (search) {
        query.$text = { $search: search };
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
      console.warn('MongoDB not available, using static data:', dbError);
      
      const { seedPrompts } = await import('@/data/seed-prompts');
      let filtered = seedPrompts;

      if (category && category !== 'all') {
        filtered = filtered.filter((p) => p.category === category);
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
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/prompts
 * Create a new prompt (requires authentication in production)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    const collection = db.collection('prompts');

    const prompt = {
      ...body,
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
    console.error('Create prompt error:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}
