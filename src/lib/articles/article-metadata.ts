/**
 * Article Metadata - DRY utilities for SEO metadata generation
 */

import { Metadata } from 'next';
import { Article } from './article-service';

/**
 * Generate SEO metadata for article pages
 */
export function generateArticleMetadata(article: Article): Metadata {
  return {
    title: article.seo?.metaTitle || `${article.title} | Engify.ai`,
    description: article.seo?.metaDescription || article.description,
    keywords: article.seo?.keywords || article.tags,
    authors: [{ name: article.author || 'Engify.ai Team' }],
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt?.toISOString(),
      authors: [article.author || 'Engify.ai Team'],
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
  };
}

/**
 * Generate Schema.org structured data for articles
 */
export function generateArticleSchema(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author || 'Engify.ai Team',
    },
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt?.toISOString() || article.publishedAt?.toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'Engify.ai',
      logo: {
        '@type': 'ImageObject',
        url: 'https://engify.ai/logo.png',
      },
    },
    keywords: article.tags?.join(', '),
    articleSection: article.category,
    wordCount: article.content?.split(/\s+/).length || 0,
  };
}

/**
 * Generate breadcrumb schema for SEO
 */
export function generateBreadcrumbSchema(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://engify.ai',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Learn',
        item: 'https://engify.ai/learn',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `https://engify.ai/learn/${article.slug}`,
      },
    ],
  };
}

