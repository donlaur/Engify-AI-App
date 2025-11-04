/**
 * Internal Linking Utilities
 * Provides utilities for finding and generating internal links
 * with SEO-optimized anchor text
 */

import { patternRepository, promptRepository, learningResourceRepository } from '@/lib/db/repositories/ContentService';
import { getPromptSlug } from '@/lib/utils/slug';

export interface InternalLink {
  url: string;
  anchorText: string;
  type: 'article' | 'prompt' | 'pattern';
  title: string;
  description?: string;
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

  // Find related articles
  if (type !== 'article') {
    const articles = await learningResourceRepository.getAll();
    const relatedArticles = articles
      .filter(
        (article) =>
          article.id !== currentId &&
          (article.tags?.some((tag) => tags.includes(tag)) ||
            article.category === category)
      )
      .slice(0, limit);
    
    relatedArticles.forEach((article) => {
      const slug = article.seo?.slug || article.id;
      links.push({
        url: `/learn/${slug}`,
        anchorText: generateAnchorText(article.title, article.tags, 'article'),
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
      .filter(
        (prompt) =>
          prompt.id !== currentId &&
          (prompt.tags?.some((tag) => tags.includes(tag)) ||
            prompt.category === category)
      )
      .slice(0, limit);
    
    relatedPrompts.forEach((prompt) => {
      const slug = getPromptSlug(prompt);
      links.push({
        url: `/prompts/${slug}`,
        anchorText: generateAnchorText(prompt.title, prompt.tags, 'prompt'),
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
      .filter(
        (pattern) =>
          pattern.id !== currentId &&
          (pattern.tags?.some((tag) => tags.includes(tag)) ||
            pattern.category === category)
      )
      .slice(0, limit);
    
    relatedPatterns.forEach((pattern) => {
      links.push({
        url: `/patterns/${encodeURIComponent(pattern.id)}`,
        anchorText: generateAnchorText(pattern.name, pattern.tags, 'pattern'),
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
  const articles = await learningResourceRepository.getAll();
  const currentArticle = articles.find(
    (a) => (a.seo?.slug || a.id) === articleSlug
  );

  if (!currentArticle) {
    return { clusters: [] };
  }

  // Check if current article is a pillar (has "pillar" tag or is featured)
  const isPillar = currentArticle.tags?.includes('pillar') || currentArticle.featured;

  if (isPillar) {
    // Find cluster articles (related articles with same category/tags)
    const clusters = articles
      .filter(
        (a) =>
          a.id !== currentArticle.id &&
          (a.tags?.some((tag) => currentArticle.tags?.includes(tag)) ||
            a.category === currentArticle.category) &&
          !a.tags?.includes('pillar')
      )
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
    const pillar = articles.find(
      (a) =>
        a.id !== currentArticle.id &&
        (a.featured || a.tags?.includes('pillar')) &&
        (a.tags?.some((tag) => currentArticle.tags?.includes(tag)) ||
          a.category === currentArticle.category)
    );

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
export async function extractContentLinks(content: string): Promise<InternalLink[]> {
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

