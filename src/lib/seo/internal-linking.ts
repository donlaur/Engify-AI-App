/**
 * Internal Linking Utilities
 * Provides utilities for finding and generating internal links
 * with SEO-optimized anchor text
 */

import {
  patternRepository,
  promptRepository,
  learningResourceRepository,
} from '@/lib/db/repositories/ContentService';
import { getPromptSlug } from '@/lib/utils/slug';
import { getCompletePillarPages, type PillarPageConfig } from '@/lib/data/pillar-pages';

export interface InternalLink {
  url: string;
  anchorText: string;
  type: 'article' | 'prompt' | 'pattern';
  title: string;
  description?: string;
}

/**
 * Find links to pillar pages
 * Returns all complete pillar pages that match the given tags/roles
 * If no tags/roles provided, returns the primary pillar page (Prompt Engineering Masterclass)
 */
export async function findPillarPageLink(
  tags?: string[],
  role?: string
): Promise<InternalLink | null> {
  const completePillars = getCompletePillarPages();
  
  // If no filters, return the primary pillar page
  if (!tags && !role) {
    const primaryPillar = completePillars.find(
      (p) => p.id === 'prompt-engineering-masterclass'
    );
    if (primaryPillar) {
      return pillarPageToInternalLink(primaryPillar);
    }
  }
  
  // Find matching pillar pages
  let matchingPillars: PillarPageConfig[] = completePillars;
  
  if (tags && tags.length > 0) {
    matchingPillars = matchingPillars.filter((pillar) => {
      const pillarTags = Array.isArray(pillar.relatedTags) ? pillar.relatedTags : [];
      return pillarTags.length > 0 && pillarTags.some((tag) => tags.includes(tag));
    });
  }
  
  if (role) {
    matchingPillars = matchingPillars.filter((pillar) => {
      const pillarRoles = Array.isArray(pillar.relatedRoles) ? pillar.relatedRoles : [];
      return pillarRoles.includes(role);
    });
  }
  
  // Return the first matching pillar, or primary if none match
  const selectedPillar = matchingPillars[0] || completePillars[0];
  return selectedPillar ? pillarPageToInternalLink(selectedPillar) : null;
}

/**
 * Find all relevant pillar pages for given tags/roles
 */
export async function findPillarPageLinks(
  tags?: string[],
  role?: string,
  limit = 3
): Promise<InternalLink[]> {
  const completePillars = getCompletePillarPages();
  
  let matchingPillars: PillarPageConfig[] = completePillars;
  
  if (tags && tags.length > 0) {
    matchingPillars = matchingPillars.filter((pillar) => {
      const pillarTags = Array.isArray(pillar.relatedTags) ? pillar.relatedTags : [];
      return pillarTags.length > 0 && pillarTags.some((tag) => tags.includes(tag));
    });
  }
  
  if (role) {
    matchingPillars = matchingPillars.filter((pillar) => {
      const pillarRoles = Array.isArray(pillar.relatedRoles) ? pillar.relatedRoles : [];
      return pillarRoles.includes(role);
    });
  }
  
  // If no matches, return primary pillar
  if (matchingPillars.length === 0) {
    const primaryPillar = completePillars.find(
      (p) => p.id === 'prompt-engineering-masterclass'
    );
    return primaryPillar ? [pillarPageToInternalLink(primaryPillar)] : [];
  }
  
  return matchingPillars
    .slice(0, limit)
    .map((pillar) => pillarPageToInternalLink(pillar));
}

/**
 * Convert PillarPageConfig to InternalLink
 */
function pillarPageToInternalLink(pillar: PillarPageConfig): InternalLink {
  return {
    url: `/learn/${pillar.slug}`,
    anchorText: pillar.title,
    type: 'article',
    title: pillar.title,
    description: pillar.description,
  };
}

/**
 * Find related content across all content types
 */
export async function findRelatedContent(
  type: 'article' | 'prompt' | 'pattern',
  currentId: string,
  tags: string[],
  category?: string,
  limit = 6
): Promise<InternalLink[]> {
  const links: InternalLink[] = [];

  // Normalize tags to ensure it's always an array
  const normalizedTags = Array.isArray(tags) ? tags : tags ? [tags] : [];

  // Find related articles - use JSON to avoid MongoDB timeouts
  if (type !== 'article') {
    const { getAllLearningResources } = await import('@/lib/learning/mongodb-learning');
    const articles = await getAllLearningResources();
    const relatedArticles = articles
      .filter((article) => {
        const articleTags = Array.isArray(article.tags)
          ? article.tags
          : article.tags
            ? [article.tags]
            : [];
        return (
          (article.id !== currentId &&
            (articleTags.length > 0 && normalizedTags.length > 0
              ? articleTags.some((tag) => normalizedTags.includes(tag))
              : false)) ||
          article.category === category
        );
      })
      .slice(0, limit);

    relatedArticles.forEach((article) => {
      const slug = article.seo?.slug || article.id;
      const articleTags = Array.isArray(article.tags)
        ? article.tags
        : article.tags
          ? [article.tags]
          : [];
      links.push({
        url: `/learn/${slug}`,
        anchorText: generateAnchorText(article.title, articleTags, 'article'),
        type: 'article',
        title: article.title,
        description: article.description,
      });
    });
  }

  // Find related prompts
  if (type !== 'prompt') {
    const prompts = await promptRepository.getAll();
    const relatedPrompts = prompts
      .filter((prompt) => {
        const promptTags = Array.isArray(prompt.tags)
          ? prompt.tags
          : prompt.tags
            ? [prompt.tags]
            : [];
        return (
          (prompt.id !== currentId &&
            (promptTags.length > 0 && normalizedTags.length > 0
              ? promptTags.some((tag) => normalizedTags.includes(tag))
              : false)) ||
          prompt.category === category
        );
      })
      .slice(0, limit);

    relatedPrompts.forEach((prompt) => {
      const slug = getPromptSlug(prompt);
      const promptTags = Array.isArray(prompt.tags)
        ? prompt.tags
        : prompt.tags
          ? [prompt.tags]
          : [];
      links.push({
        url: `/prompts/${slug}`,
        anchorText: generateAnchorText(prompt.title, promptTags, 'prompt'),
        type: 'prompt',
        title: prompt.title,
        description: prompt.description,
      });
    });
  }

  // Find related patterns
  if (type !== 'pattern') {
    const patterns = await patternRepository.getAll();
    const relatedPatterns = patterns
      .filter((pattern) => {
        // Patterns don't have tags, so match by category or useCases if available
        const matchesCategory = category && pattern.category.toLowerCase() === category.toLowerCase();
        const matchesUseCases = pattern.useCases && normalizedTags.length > 0
          ? pattern.useCases.some((useCase) => 
              normalizedTags.some((tag) => useCase.toLowerCase().includes(tag.toLowerCase()))
            )
          : false;
        
        return pattern.id !== currentId && (matchesCategory || matchesUseCases);
      })
      .slice(0, limit);

    relatedPatterns.forEach((pattern) => {
      links.push({
        url: `/patterns/${encodeURIComponent(pattern.id)}`,
        anchorText: generateAnchorText(pattern.name, [], 'pattern'),
        type: 'pattern',
        title: pattern.name,
        description: pattern.description,
      });
    });
  }

  return links.slice(0, limit);
}

/**
 * Generate SEO-friendly anchor text
 */
function generateAnchorText(
  title: string,
  tags?: string[],
  type?: 'article' | 'prompt' | 'pattern'
): string {
  // For patterns, use descriptive text
  if (type === 'pattern') {
    return `Learn the ${title} pattern`;
  }

  // For prompts, use action-oriented text
  if (type === 'prompt') {
    const keywords = title.toLowerCase().split(/\s+/).slice(0, 3).join(' ');
    return `Use ${keywords} prompt`;
  }

  // For articles, use the title or create variations
  const keywords = title
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 3)
    .join(' ');

  if (tags && tags.length > 0) {
    return `Read about ${keywords}${tags[0] ? ` and ${tags[0]}` : ''}`;
  }

  return title;
}

/**
 * Find pillar/cluster relationships
 */
export async function findPillarClusterLinks(
  articleSlug: string
): Promise<{ pillar?: InternalLink; clusters: InternalLink[] }> {
  // Use JSON to avoid MongoDB timeouts
  const { getAllLearningResources } = await import('@/lib/learning/mongodb-learning');
  const articles = await getAllLearningResources();
  const currentArticle = articles.find(
    (a) => (a.seo?.slug || a.id) === articleSlug
  );

  if (!currentArticle) {
    return { clusters: [] };
  }

  // Check if current article is a pillar (has "pillar" tag or is featured)
  const articleTags = Array.isArray(currentArticle.tags)
    ? currentArticle.tags
    : currentArticle.tags
      ? [currentArticle.tags]
      : [];
  const isPillar = articleTags.includes('pillar') || currentArticle.featured;

  if (isPillar) {
    // Find cluster articles (related articles with same category/tags)
    const clusters = articles
      .filter((a) => {
        const aTags = Array.isArray(a.tags) ? a.tags : a.tags ? [a.tags] : [];
        return (
          (a.id !== currentArticle.id &&
            (aTags.length > 0 && articleTags.length > 0
              ? aTags.some((tag) => articleTags.includes(tag))
              : false)) ||
          (a.category === currentArticle.category && !aTags.includes('pillar'))
        );
      })
      .slice(0, 6)
      .map((article) => {
        const slug = article.seo?.slug || article.id;
        return {
          url: `/learn/${slug}`,
          anchorText: article.title,
          type: 'article' as const,
          title: article.title,
          description: article.description,
        };
      });

    return { clusters };
  } else {
    // Find pillar article (featured article with same category/tags)
    const pillar = articles.find((a) => {
      const aTags = Array.isArray(a.tags) ? a.tags : a.tags ? [a.tags] : [];
      return (
        (a.id !== currentArticle.id &&
          (a.featured || aTags.includes('pillar')) &&
          (aTags.length > 0 && articleTags.length > 0
            ? aTags.some((tag) => articleTags.includes(tag))
            : false)) ||
        a.category === currentArticle.category
      );
    });

    if (pillar) {
      const slug = pillar.seo?.slug || pillar.id;
      return {
        pillar: {
          url: `/learn/${slug}`,
          anchorText: generateAnchorText(pillar.title, pillar.tags, 'article'),
          type: 'article',
          title: pillar.title,
          description: pillar.description,
        },
        clusters: [],
      };
    }
  }

  return { clusters: [] };
}

/**
 * Extract potential internal links from content
 * Finds mentions of patterns, prompts, or articles that we can link to
 */
export async function extractContentLinks(
  content: string
): Promise<InternalLink[]> {
  const links: InternalLink[] = [];

  // Find pattern mentions
  const patterns = await patternRepository.getAll();
  patterns.forEach((pattern) => {
    // Check if pattern name appears in content (case-insensitive)
    const patternRegex = new RegExp(`\\b${pattern.name}\\b`, 'i');
    if (patternRegex.test(content)) {
      links.push({
        url: `/patterns/${encodeURIComponent(pattern.id)}`,
        anchorText: pattern.name,
        type: 'pattern',
        title: pattern.name,
        description: pattern.description,
      });
    }
  });

  // Find prompt mentions (by title keywords)
  const prompts = await promptRepository.getAll();
  prompts.forEach((prompt) => {
    // Extract key words from prompt title
    const keywords = prompt.title
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 4)
      .slice(0, 2);

    if (keywords.length > 0) {
      const keywordRegex = new RegExp(`\\b${keywords.join('\\s+')}\\b`, 'i');
      if (keywordRegex.test(content)) {
        const slug = getPromptSlug(prompt);
        links.push({
          url: `/prompts/${slug}`,
          anchorText: prompt.title,
          type: 'prompt',
          title: prompt.title,
          description: prompt.description,
        });
      }
    }
  });

  return links;
}
