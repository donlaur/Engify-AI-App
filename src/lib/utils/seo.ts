/**
 * SEO utilities for meta tags and structured data
 */

import { APP_NAME, APP_URL } from '@/lib/constants';

export interface SEOConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export function generateMetaTags(config: SEOConfig) {
  const {
    title,
    description,
    image = `${APP_URL}/og-image.png`,
    url = APP_URL,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
  } = config;

  const fullTitle = title.includes(APP_NAME) ? title : `${title} | ${APP_NAME}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: APP_NAME,
      images: [{ url: image }],
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      ...(author && { creator: author }),
    },
  };
}

export function generateStructuredData(type: 'Organization' | 'Article' | 'WebPage', data: Record<string, unknown>) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  return {
    ...baseData,
    ...data,
  };
}
