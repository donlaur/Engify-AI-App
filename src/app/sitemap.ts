import { MetadataRoute } from 'next';
import { APP_URL } from '@/lib/constants';
import { getSeedPromptsWithTimestamps } from '@/data/seed-prompts';

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
      url: `${baseUrl}/library`,
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

  // Get all prompts for dynamic routes
  const prompts = getSeedPromptsWithTimestamps();
  
  // Individual prompt pages: /library/[id]
  const promptPages: MetadataRoute.Sitemap = prompts.map((prompt) => ({
    url: `${baseUrl}/library/${prompt.id}`,
    lastModified: new Date(prompt.updatedAt || prompt.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Extract unique categories, roles, patterns, and tags
  const categories = Array.from(new Set(prompts.map((p) => p.category).filter(Boolean)));
  const roles = Array.from(new Set(prompts.map((p) => p.role).filter(Boolean)));
  const patterns = Array.from(new Set(prompts.map((p) => p.pattern).filter(Boolean)));
  
  // Collect all unique tags
  const allTags = Array.from(
    new Set(
      prompts.flatMap((p) => p.tags || []).filter(Boolean)
    )
  );

  // Category pages: /library/category/[category]
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/library/category/${category}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Role pages: /library/role/[role]
  const roleFilterPages: MetadataRoute.Sitemap = roles.map((role) => ({
    url: `${baseUrl}/library/role/${role}`,
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

  // Learning content pages (examples)
  const learnPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/learn/prompt-engineering-101`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn/ai-patterns`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn/kernel-framework`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn/chain-of-thought`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/learn/few-shot-learning`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/learn/prompt-optimization`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

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

  // Log count for monitoring
  console.log(`?? Sitemap generated: ${allPages.length} URLs`);

  return allPages;
}
