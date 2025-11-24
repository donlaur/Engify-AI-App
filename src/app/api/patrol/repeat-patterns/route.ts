import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const PATROL_GATEWAY_URL = process.env.PATROL_GATEWAY_URL || 'http://localhost:8080';

/**
 * GET /api/patrol/repeat-patterns
 * 
 * Fetches repeat patterns from the patrol gateway for the authenticated user.
 * Proxies the request to the patrol gateway service.
 */
export async function GET(_request: Request) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use user ID for patrol gateway user_id, or fall back to email
    const userId = session.user.id || session.user.email || 'anonymous';

    // Fetch from patrol gateway
    const url = `${PATROL_GATEWAY_URL}/api/patrol/repeat-patterns?user_id=${encodeURIComponent(userId)}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If gateway is not available, return empty patterns instead of error
      // This allows the UI to work even if the gateway is down
      if (response.status === 404 || response.status >= 500) {
        return NextResponse.json({ patterns: [] });
      }
      throw new Error(`Patrol gateway error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      patterns: data.patterns || [],
    });
  } catch (error) {
    // Log error but return empty patterns to avoid breaking the UI
    console.error('Patrol gateway fetch error:', error);
    return NextResponse.json(
      { patterns: [] },
      { status: 200 } // Return 200 with empty patterns instead of error
    );
  }
}

