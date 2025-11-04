import { MetadataRoute } from 'next';
import { APP_URL } from '@/lib/constants';
import { getDb } from '@/lib/mongodb';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

/**
 * Dynamic Sitemap Generator
 * Generates 200+ URLs from static pages + dynamic content (prompts, patterns, tags)
 *
 * SEO Strategy:
 * - Priority 1.0: Homepage
 * - Priority 0.9: Main sections (library, patterns, built-in-public)
 * - Priority 0.8: Role pages, individual prompts
 * - Priority 0.7: Tags, learn pages
 * - Priority 0.6: About, blog
 * - Priority 0.5: Contact, terms, privacy
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = APP_URL;
  const now = new Date();

  // Static core pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/prompts`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/patterns`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/learn`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn/prompt-engineering-masterclass`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kernel`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/built-in-public`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/workbench`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/workbench/multi-agent`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/audit`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Role-based landing pages (CTO, Directors, Managers, Engineers, etc.)
  const rolePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/for-c-level`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-directors`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-managers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-engineers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-pms`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-designers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-qa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-security-engineers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-data-scientists`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-technical-writers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Utility pages
  const utilityPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Get all prompts for dynamic routes from MongoDB
  let prompts: Array<{
    id: string;
    category?: string;
    role?: string;
    pattern?: string;
    tags?: string[];
    updatedAt?: Date;
    createdAt?: Date;
  }> = [];

  try {
    const db = await getDb();
    const promptsCollection = await db.collection('prompts').find({}).toArray();
    prompts = promptsCollection.map((p: any) => ({
      id: p.id || p._id?.toString(),
      category: p.category,
      role: p.role,
      pattern: p.pattern,
      tags: p.tags,
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
      createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch prompts from MongoDB for sitemap:', error);
    // If MongoDB fails, we'll just have fewer URLs in the sitemap
  }

  // Individual prompt pages: /prompts/[slug] - use slug for better SEO
  const { getPromptSlug } = await import('@/lib/utils/slug');
  const promptPages: MetadataRoute.Sitemap = prompts.map((prompt) => ({
    url: `${baseUrl}/prompts/${getPromptSlug(prompt)}`,
    lastModified: new Date(prompt.updatedAt || prompt.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Extract unique categories, roles, patterns, and tags
  const categories = Array.from(
    new Set(prompts.map((p) => p.category).filter(Boolean))
  );
  const roles = Array.from(new Set(prompts.map((p) => p.role).filter(Boolean)));
  const patterns = Array.from(
    new Set(prompts.map((p) => p.pattern).filter(Boolean))
  );

  // Collect all unique tags
  const allTags = Array.from(
    new Set(prompts.flatMap((p) => p.tags || []).filter(Boolean))
  );

  // Category pages: /prompts/category/[category]
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/prompts/category/${category}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Role pages: /prompts/role/[role]
  const roleFilterPages: MetadataRoute.Sitemap = roles.map((role) => ({
    url: `${baseUrl}/prompts/role/${role}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Pattern detail pages: /patterns/[pattern]
  const patternPages: MetadataRoute.Sitemap = patterns.map((pattern) => ({
    url: `${baseUrl}/patterns/${pattern}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Tag pages: /tags/[tag]
  const tagPages: MetadataRoute.Sitemap = allTags.map((tag) => ({
    url: `${baseUrl}/tags/${tag}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Learning content pages - Fetch dynamically from MongoDB
  let learnPages: MetadataRoute.Sitemap = [];
  try {
    const db = await getDb();
    const learningResources = await db
      .collection('learning_resources')
      .find({
        status: 'active',
        'seo.slug': { $exists: true, $ne: null },
      })
      .project({
        'seo.slug': 1,
        updatedAt: 1,
        publishedAt: 1,
      })
      .toArray();

    learnPages = learningResources.map((resource: any) => ({
      url: `${baseUrl}/learn/${resource.seo.slug}`,
      lastModified: resource.updatedAt
        ? new Date(resource.updatedAt)
        : resource.publishedAt
          ? new Date(resource.publishedAt)
          : now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Failed to fetch learning resources for sitemap:', error);
    // Fallback to empty array if MongoDB fails
  }

  // Combine all URLs
  const allPages = [
    ...staticPages,
    ...rolePages,
    ...utilityPages,
    ...promptPages,
    ...categoryPages,
    ...roleFilterPages,
    ...patternPages,
    ...tagPages,
    ...learnPages,
  ];

  // Sitemap generated with allPages.length URLs

  return allPages;
}
