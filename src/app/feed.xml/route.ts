/**
 * RSS Feed Route
 * 
 * Generates RSS 2.0 compliant feed from learning resources
 * Auto-updates from MongoDB
 * 
 * Route: GET /feed.xml
 */

import { NextResponse } from 'next/server';
import { getClient } from '@/lib/mongodb';
import { APP_URL } from '@/lib/constants';
import { logger } from '@/lib/logging/logger';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

/**
 * Generate RSS 2.0 XML feed
 */
function generateRSSFeed(items: Array<{
  title: string;
  description: string;
  link: string;
  pubDate: string;
  author?: string;
  categories?: string[];
  guid: string;
}>): string {
  const feedTitle = 'Engify.ai - AI Training Platform for Engineering Teams';
  const feedDescription = 'Learn prompt engineering, AI best practices, and engineering workflows through structured learning paths and proven patterns.';
  const feedLink = APP_URL;
  const feedLanguage = 'en-US';
  const lastBuildDate = new Date().toUTCString();

  const itemsXML = items.map(item => {
    const categoriesXML = item.categories?.map(cat => 
      `    <category>${escapeXML(cat)}</category>`
    ).join('\n') || '';

    const authorXML = item.author 
      ? `    <author>${escapeXML(item.author)}</author>`
      : '';

    return `  <item>
    <title>${escapeXML(item.title)}</title>
    <description>${escapeXML(item.description)}</description>
    <link>${escapeXML(item.link)}</link>
    <guid isPermaLink="true">${escapeXML(item.guid)}</guid>
    <pubDate>${item.pubDate}</pubDate>
${authorXML ? authorXML + '\n' : ''}${categoriesXML ? categoriesXML + '\n' : ''}  </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXML(feedTitle)}</title>
    <description>${escapeXML(feedDescription)}</description>
    <link>${escapeXML(feedLink)}</link>
    <language>${feedLanguage}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXML(`${feedLink}/feed.xml`)}" rel="self" type="application/rss+xml" />
    <generator>Engify.ai RSS Feed Generator</generator>
    <webMaster>contact@engify.ai (Engify.ai Team)</webMaster>
    <managingEditor>contact@engify.ai (Engify.ai Team)</managingEditor>
    <image>
      <url>${escapeXML(`${feedLink}/logo.png`)}</url>
      <title>${escapeXML(feedTitle)}</title>
      <link>${escapeXML(feedLink)}</link>
    </image>
${itemsXML}
  </channel>
</rss>`;
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Format date for RSS (RFC 822 format)
 */
function formatRSSDate(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const day = days[date.getUTCDay()];
  const month = months[date.getUTCMonth()];
  const dayNum = date.getUTCDate();
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  
  return `${day}, ${dayNum} ${month} ${year} ${hours}:${minutes}:${seconds} GMT`;
}

/**
 * GET /feed.xml
 * Generate RSS feed from learning resources
 */
export async function GET() {
  try {
    const client = await getClient();
    const db = client.db('engify');
    const collection = db.collection('learning_resources');

    // Fetch all active learning resources
    // Sort by published date (newest first) for RSS feed
    const resources = await collection
      .find({
        status: 'active',
        'seo.slug': { $exists: true, $ne: null },
        publishedAt: { $exists: true },
      })
      .sort({ publishedAt: -1 })
      .limit(50) // RSS feeds typically show 10-50 items
      .project({
        _id: 0,
        id: 1,
        title: 1,
        description: 1,
        author: 1,
        category: 1,
        tags: 1,
        'seo.slug': 1,
        publishedAt: 1,
        updatedAt: 1,
      })
      .toArray();

    // Transform to RSS items
    const items = resources.map((resource: any) => {
      const slug = resource.seo?.slug || resource.id;
      const link = `${APP_URL}/learn/${slug}`;
      const pubDate = resource.publishedAt 
        ? formatRSSDate(new Date(resource.publishedAt))
        : formatRSSDate(new Date());
      
      // Combine category and tags for RSS categories
      const categories: string[] = [];
      if (resource.category) {
        categories.push(resource.category);
      }
      if (resource.tags && Array.isArray(resource.tags)) {
        categories.push(...resource.tags.slice(0, 5)); // Limit to 5 tags
      }

      return {
        title: resource.title,
        description: resource.description || resource.seo?.metaDescription || '',
        link,
        pubDate,
        author: resource.author || 'Engify.ai Team',
        categories: categories.length > 0 ? categories : undefined,
        guid: link, // Use URL as GUID (permanent link)
      };
    });

    // Generate RSS XML
    const rssXML = generateRSSFeed(items);

    // Return as XML
    return new NextResponse(rssXML, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    logger.apiError('/feed.xml', error, { method: 'GET' });
    
    // Return minimal valid RSS feed on error
    const errorFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Engify.ai - RSS Feed</title>
    <description>Error loading feed</description>
    <link>${APP_URL}</link>
  </channel>
</rss>`;

    return new NextResponse(errorFeed, {
      status: 500,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
      },
    });
  }
}

