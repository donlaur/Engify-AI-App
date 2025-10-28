import { NextResponse } from 'next/server';
import { tagTaxonomy, getAllTags, getTagsByCategory } from '@/lib/tags-taxonomy';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tags
 * 
 * Get tag taxonomy
 * 
 * Query params:
 * - category: filter by category ID
 * - flat: return flat list of all tags (default: false)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const flat = searchParams.get('flat') === 'true';
    
    if (flat) {
      // Return flat list of all tags
      const tags = getAllTags();
      return NextResponse.json({ tags });
    }
    
    if (category) {
      // Return tags for specific category
      const tags = getTagsByCategory(category);
      return NextResponse.json({ tags });
    }
    
    // Return full hierarchy
    return NextResponse.json({ taxonomy: tagTaxonomy });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
