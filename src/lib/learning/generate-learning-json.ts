/**
 * Generate Learning Resources JSON - Reusable Function
 *
 * Can be called from API routes or scripts
 */

import { learningResourceRepository } from '@/lib/db/repositories/ContentService';
import fs from 'fs/promises';
import path from 'path';

interface LearningResourceExport {
  id: string;
  title: string;
  description: string;
  content?: string;
  slug: string;
  category?: string;
  tags?: string[];
  author?: string;
  publishedAt?: Date;
  updatedAt?: Date;
  views?: number;
  status?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
    slug?: string;
  };
}

interface LearningResourcesExport {
  version: '1.0';
  generatedAt: string;
  totalResources: number;
  resources: LearningResourceExport[];
  totals: {
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

export async function generateLearningResourcesJson(): Promise<void> {
  // Fetch all learning resources from MongoDB
  const resources = await learningResourceRepository.getAll();

  // Count by category and status
  const byCategory: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  resources.forEach((resource) => {
    if (resource.category) {
      byCategory[resource.category] = (byCategory[resource.category] || 0) + 1;
    }
    if (resource.status) {
      byStatus[resource.status] = (byStatus[resource.status] || 0) + 1;
    }
  });

  // Transform resources for export
  const resourcesExport: LearningResourceExport[] = resources.map(
    (resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      content: resource.contentHtml,
      slug: resource.seo.slug,
      category: resource.category,
      tags: resource.tags,
      author: resource.author,
      publishedAt: resource.publishedAt,
      updatedAt: resource.updatedAt,
      views: resource.views,
      status: resource.status,
      seo: resource.seo,
    })
  );

  // Build export object
  const exportData: LearningResourcesExport = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    totalResources: resources.length,
    resources: resourcesExport,
    totals: {
      byCategory,
      byStatus,
    },
  };

  // Ensure public/data directory exists
  const dataDir = path.join(process.cwd(), 'public', 'data');
  await fs.mkdir(dataDir, { recursive: true });

  // Write JSON file (minified for smaller file size)
  const jsonPath = path.join(dataDir, 'learning.json');
  const jsonContent = JSON.stringify(exportData); // Minified (no indentation)

  await fs.writeFile(jsonPath, jsonContent, 'utf-8');
}
