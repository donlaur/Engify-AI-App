import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const MEM0_API_URL = process.env.MEM0_API_URL || 'http://localhost:8765';

export async function GET(request: Request) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use user ID for mem0 user_id, or fall back to email
    const userId = session.user.id || session.user.email || 'anonymous';

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('page_size') || '50';
    const type = searchParams.get('type');

    // Fetch from mem0
    const url = `${MEM0_API_URL}/api/v1/memories/?user_id=${encodeURIComponent(userId)}&page=${page}&page_size=${pageSize}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`mem0 API error: ${response.status}`);
    }

    const data = await response.json();

    // Optionally filter by type client-side (mem0 filter endpoint is buggy)
    let items = data.items || [];
    if (type && type !== 'all') {
      items = items.filter((item: { metadata_?: { type?: string } }) =>
        item.metadata_?.type === type
      );
    }

    return NextResponse.json({
      items,
      total: data.total || items.length,
      page: parseInt(page),
      page_size: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Memory fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch memories' },
      { status: 500 }
    );
  }
}
