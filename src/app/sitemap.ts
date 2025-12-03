import { MetadataRoute } from 'next';
import { APP_URL } from '@/lib/constants';
import { getDb } from '@/lib/mongodb';
import { getCompletePillarPages } from '@/lib/data/pillar-pages';
import { loadWorkflowsFromJson } from '@/lib/workflows/load-workflows-from-json';
import { loadPainPointsFromJson } from '@/lib/workflows/load-pain-points-from-json';
import { loadRecommendationsFromJson } from '@/lib/workflows/load-recommendations-from-json';
import { getPromptSlug } from '@/lib/utils/slug';

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
 *
 * ISR: Regenerates every 12 hours when accessed (faster for frequent crawls)
 * Cron: Also revalidates daily at midnight via Vercel Cron (ensures freshness)
 */

export const revalidate = 43200; // Revalidate every 12 hours (ISR when accessed)

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
    // Pillar pages - explicitly include all complete pillar pages
    ...getCompletePillarPages().map((pillar) => ({
      url: `${baseUrl}/learn/${pillar.slug}`,
      lastModified: pillar.updatedAt || pillar.createdAt || now,
      changeFrequency: 'monthly' as const,
      priority: 0.9, // High priority for pillar pages
    })),
    {
      url: `${baseUrl}/learn/chain-of-thought-guide`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn/code-generation-guide`,
      lastModified: now,
      changeFrequency: 'monthly',
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
    {
      url: `${baseUrl}/workflows`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guardrails`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/workflows/pain-points`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/workflows/recommendations`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/agile`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/agile/wsjf`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ai-enabled-agile`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
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
      url: `${baseUrl}/for-engineering-directors`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-product-directors`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-vp-engineering`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-vp-product`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/for-ctos`,
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
      url: `${baseUrl}/authors/donnie-laur`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hireme`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
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
    slug?: string;
    title?: string;
    category?: string;
    role?: string;
    pattern?: string;
    tags?: string[];
    updatedAt?: Date;
    lastRevisedAt?: Date;
    createdAt?: Date;
  }> = [];

  try {
    const db = await getDb();
    const promptsCollection = await db.collection('prompts').find({}).toArray();
    prompts = promptsCollection.map((p: any) => ({
      id: p.id || p._id?.toString(),
      slug: p.slug, // Include slug from database
      title: p.title, // Include title for slug generation fallback
      category: p.category,
      role: p.role,
      pattern: p.pattern,
      tags: p.tags,
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
      lastRevisedAt: p.lastRevisedAt ? new Date(p.lastRevisedAt) : undefined,
      createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch prompts from MongoDB for sitemap:', error);
    // If MongoDB fails, we'll just have fewer URLs in the sitemap
  }

  // Individual prompt pages: /prompts/[slug] - use slug for better SEO
  // Filter out prompts with invalid slugs (empty, 'untitled', or missing)
  const promptPages = prompts
    .map((prompt) => {
      // Skip prompts without valid ID
      if (!prompt.id) {
        return null;
      }

      const slug = getPromptSlug(prompt);
      
      // Validate slug: must exist, not be empty, not be 'untitled', and not match ID
      // Also filter out internal reference IDs (ref-001, cg-002, gen-001, arch-001, etc.) and generated IDs
      const isInternalId = /^(ref-|cg-|doc-|db-|dir-|gen-|arch-|test-|decision-|conflict-|facilitator-|generated-)/i.test(slug || '') ||
        /^[a-z]{2,4}-\d{3}$/i.test(slug || '') || // Pattern like "ref-001", "gen-001"
        /-\d{3}$/.test(slug || ''); // Ends with -001, -002, etc. (likely internal IDs)
      
      // Check for duplicate/redundant patterns in slug (very long slugs with repeated sequences)
      const hasDuplicatePattern = slug && slug.length > 50 && (() => {
        const words = slug.split('-');
        if (words.length < 10) return false;
        // Check for repeated sequences of 3+ words
        for (let seqLen = 3; seqLen <= Math.min(5, Math.floor(words.length / 2)); seqLen++) {
          for (let i = 0; i <= words.length - seqLen * 2; i++) {
            const sequence1 = words.slice(i, i + seqLen).join('-');
            for (let j = i + seqLen; j <= words.length - seqLen; j++) {
              const sequence2 = words.slice(j, j + seqLen).join('-');
              if (sequence1 === sequence2) {
                return true; // Found duplicate sequence
              }
            }
          }
        }
        return false;
      })();
      
      const isValidSlug = slug && 
        slug !== '' && 
        slug !== 'untitled' && 
        slug !== prompt.id &&
        !isInternalId &&
        !hasDuplicatePattern;

      if (!isValidSlug) {
        // Skip prompts with invalid slugs - don't use ID as fallback for SEO
        return null;
      }

      return {
        url: `${baseUrl}/prompts/${encodeURIComponent(slug)}`,
        lastModified: prompt.lastRevisedAt || prompt.updatedAt || prompt.createdAt || now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    })
    .filter((page): page is NonNullable<typeof page> =>
      page !== null &&
      Boolean(page.url) &&
      !page.url.includes('/untitled') &&
      !page.url.includes('generated-') &&
      !page.url.match(/\/prompts\/(ref-|cg-|doc-|db-|dir-|gen-|arch-|test-|decision-|conflict-|facilitator-)/i) // Filter out internal IDs
    ) as MetadataRoute.Sitemap; // Remove null entries and invalid URLs

  // Extract unique categories, roles, and tags from prompts
  const categories = Array.from(
    new Set(prompts.map((p) => p.category).filter(Boolean))
  );
  const roles = Array.from(new Set(prompts.map((p) => p.role).filter(Boolean)));

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

  // Pattern detail pages: /patterns/[pattern] - Fetch ALL patterns from MongoDB
  let patternPages: MetadataRoute.Sitemap = [];
  try {
    const db = await getDb();
    const patternsCollection = await db
      .collection('patterns')
      .find({})
      .toArray();
    patternPages = patternsCollection.map((pattern: any) => ({
      url: `${baseUrl}/patterns/${encodeURIComponent(pattern.id || pattern._id?.toString() || pattern.name)}`,
      lastModified: pattern.updatedAt
        ? new Date(pattern.updatedAt)
        : pattern.createdAt
          ? new Date(pattern.createdAt)
          : now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Failed to fetch patterns from MongoDB for sitemap:', error);
    // Fallback to empty array if MongoDB fails
  }

  // Tag pages: /tags/[tag] - URL encode tags with special characters
  const tagPages: MetadataRoute.Sitemap = allTags
    .filter((tag) => tag && typeof tag === 'string' && tag.trim().length > 0)
    .map((tag) => ({
      url: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
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

  // AI Models & Tools pages - SEO-optimized content
  let aiModelPages: MetadataRoute.Sitemap = [];
  let aiToolPages: MetadataRoute.Sitemap = [];
  try {
    const db = await getDb();

    // AI Models hub and individual pages
    const aiModels = await db
      .collection('ai_models')
      .find({
        isAllowed: { $ne: false },
        slug: { $exists: true, $ne: null },
      })
      .project({
        slug: 1,
        updatedAt: 1,
        lastVerified: 1,
      })
      .toArray();

    // Add hub page
    aiModelPages.push({
      url: `${baseUrl}/learn/ai-models`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    });

    // Add deprecated/EOL page
    aiModelPages.push({
      url: `${baseUrl}/learn/ai-models/deprecated`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    });

    // Add individual model pages - filter out models with problematic slugs
    aiModelPages = [
      ...aiModelPages,
      ...aiModels
        .filter((model: any) => {
          const slug = model.slug;
          // Filter out slugs with concatenated provider names
          if (!slug) return false;
          const isProblematic =
            slug.includes('anthropicclaude') ||
            slug.includes('mistralaimistral') ||
            slug.includes('mistralaimagistral') ||
            slug.includes('meta-llamallama') ||
            slug.includes('ai21jamba') ||
            slug.includes('googlegemini') ||
            slug.startsWith('openaigpt') ||
            slug.startsWith('openaio') ||
            slug.startsWith('openaicodex') ||
            slug.startsWith('qwenqwen') ||
            slug.startsWith('inflectioninflection') ||
            slug.startsWith('alfredproscodellama') ||
            slug.startsWith('inceptionmercury') ||
            slug.startsWith('undi95remm') ||
            slug.includes('perplexitysonar') ||
            slug.includes('togethercomputer');
          return !isProblematic;
        })
        .map((model: any) => ({
          url: `${baseUrl}/learn/ai-models/${model.slug}`,
          lastModified: model.updatedAt
            ? new Date(model.updatedAt)
            : model.lastVerified
              ? new Date(model.lastVerified)
              : now,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        })),
    ];

    // AI Tools hub and individual pages
    const aiTools = await db
      .collection('ai_tools')
      .find({
        status: 'active',
        slug: { $exists: true, $ne: null },
      })
      .project({
        slug: 1,
        updatedAt: 1,
        lastUpdated: 1,
      })
      .toArray();

    // Add hub page
    aiToolPages.push({
      url: `${baseUrl}/learn/ai-tools`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    });

    // Add individual tool pages
    aiToolPages = [
      ...aiToolPages,
      ...aiTools.map((tool: any) => ({
        url: `${baseUrl}/learn/ai-tools/${tool.slug}`,
        lastModified: tool.updatedAt
          ? new Date(tool.updatedAt)
          : tool.lastUpdated
            ? new Date(tool.lastUpdated)
            : now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ];
  } catch (error) {
    console.error('Failed to fetch AI models/tools for sitemap:', error);
    // Fallback to empty arrays if MongoDB fails
  }

  // Workflows, Guardrails, Pain Points, and Recommendations pages
  let workflowPages: MetadataRoute.Sitemap = [];
  let guardrailPages: MetadataRoute.Sitemap = [];
  let painPointPages: MetadataRoute.Sitemap = [];
  let recommendationPages: MetadataRoute.Sitemap = [];

  try {
    // Load workflows (includes guardrails as a category)
    const workflows = await loadWorkflowsFromJson();
    const publishedWorkflows = workflows.filter((w) => w.status === 'published');

    // Regular workflows: /workflows/[category]/[slug]
    const regularWorkflows = publishedWorkflows.filter((w) => w.category !== 'guardrails');
    workflowPages = regularWorkflows.map((workflow) => ({
      url: `${baseUrl}/workflows/${workflow.category}/${workflow.slug}`,
      lastModified: now, // TODO: Add updatedAt field to workflow schema
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

    // Guardrails: /workflows/guardrails/[slug] (same as regular workflows)
    const guardrails = publishedWorkflows.filter((w) => w.category === 'guardrails');
    guardrailPages = guardrails.map((guardrail) => ({
      url: `${baseUrl}/workflows/${guardrail.category}/${guardrail.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Failed to fetch workflows/guardrails for sitemap:', error);
  }

  try {
    // Load pain points
    const painPoints = await loadPainPointsFromJson();
    const publishedPainPoints = painPoints.filter((pp) => pp.status === 'published');

    // Pain points: /workflows/pain-points/[slug]
    painPointPages = publishedPainPoints.map((painPoint) => ({
      url: `${baseUrl}/workflows/pain-points/${painPoint.slug}`,
      lastModified: now, // TODO: Add updatedAt field to pain point schema
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Failed to fetch pain points for sitemap:', error);
  }

  try {
    // Load recommendations
    const recommendations = await loadRecommendationsFromJson();
    const publishedRecommendations = recommendations.filter((rec) => rec.status === 'published');

    // Recommendations: /workflows/recommendations/[slug]
    recommendationPages = publishedRecommendations.map((recommendation) => ({
      url: `${baseUrl}/workflows/recommendations/${recommendation.slug}`,
      lastModified: now, // TODO: Add updatedAt field to recommendation schema
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Failed to fetch recommendations for sitemap:', error);
  }

  // MCP Server pages (moved from subdomain to /mcp path)
  const mcpPages: MetadataRoute.Sitemap = [
    {
      url: 'https://engify.ai/mcp',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://engify.ai/mcp/tools/memory',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://engify.ai/mcp/tools/assess',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://engify.ai/mcp/tools/pattern',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://engify.ai/mcp/tools/context',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://engify.ai/mcp/tools/monitor',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://engify.ai/mcp/tools/help',
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
    ...aiModelPages,
    ...aiToolPages,
    ...workflowPages,
    ...guardrailPages,
    ...painPointPages,
    ...recommendationPages,
    ...mcpPages,
  ];

  // Sitemap generated with allPages.length URLs
  console.log(`Generated sitemap with ${allPages.length} URLs:
    - Static pages: ${staticPages.length}
    - Role pages: ${rolePages.length}
    - Utility pages: ${utilityPages.length}
    - Prompt pages: ${promptPages.length}
    - Category pages: ${categoryPages.length}
    - Role filter pages: ${roleFilterPages.length}
    - Pattern pages: ${patternPages.length}
    - Tag pages: ${tagPages.length}
    - Learn pages: ${learnPages.length}
    - AI model pages: ${aiModelPages.length}
    - AI tool pages: ${aiToolPages.length}
    - Workflow pages: ${workflowPages.length}
    - Guardrail pages: ${guardrailPages.length}
    - Pain point pages: ${painPointPages.length}
    - Recommendation pages: ${recommendationPages.length}
    - MCP Server pages: ${mcpPages.length}`);

  return allPages;
}
