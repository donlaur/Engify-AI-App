import { NextResponse } from 'next/server';
import { APP_URL } from '@/lib/constants';
import { getMongoDb } from '@/lib/db/mongodb';

/**
 * RSS Feed for Learning Content
 * Provides RSS feed for blog posts and learning articles
 * This helps with content discovery and SEO
 * 
 * Accessible at: /feed
 */

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const db = await getMongoDb();
    
    // Fetch recent learning articles
    // Public query - organizationId not required for public learning content
    // This is intentional: RSS feed includes public articles accessible to all users
    const articles = await db
      .collection('learning_resources')
      .find({
        status: 'active',
        'seo.slug': { $exists: true, $ne: null },
      })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(50)
      .project({
        title: 1,
        description: 1,
        'seo.slug': 1,
        publishedAt: 1,
        updatedAt: 1,
        createdAt: 1,
        author: 1,
      })
      .toArray();

    const buildDate = new Date().toUTCString();
    
    const rssItems = articles.map((article: {
      title: string;
      description?: string;
      seo?: { slug?: string; description?: string };
      slug?: string;
      publishedAt?: Date;
      updatedAt?: Date;
      createdAt?: Date;
      author?: { name?: string } | string;
    }) => {
      const slug = article.seo?.slug || article.slug;
      const url = `${APP_URL}/learn/${slug}`;
      const pubDate = (article.publishedAt || article.createdAt) 
        ? new Date(article.publishedAt || article.createdAt).toUTCString()
        : buildDate;
      const description = article.description || article.seo?.description || '';
      const author = (article.author && typeof article.author === 'object' && 'name' in article.author) 
        ? String(article.author.name) 
        : 'Engify.ai Team';
      
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(author)}</author>
      <category>AI Training</category>
      <category>Prompt Engineering</category>
    </item>`;
    }).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Engify.ai - AI Training Platform for Engineering Teams</title>
    <link>${APP_URL}</link>
    <description>Learn prompt engineering, AI patterns, and best practices for engineering teams. Free training resources, tutorials, and guides.</description>
    <language>en-US</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <pubDate>${buildDate}</pubDate>
    <ttl>60</ttl>
    <atom:link href="${APP_URL}/feed" rel="self" type="application/rss+xml"/>
    <image>
      <url>${APP_URL}/logo.png</url>
      <title>Engify.ai</title>
      <link>${APP_URL}</link>
    </image>
${rssItems}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Failed to generate RSS feed:', error);
    return new NextResponse('Failed to generate RSS feed', { status: 500 });
  }
}

function escapeXml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
