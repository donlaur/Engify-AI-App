#!/usr/bin/env tsx
/**
 * Bulk Content Importer for Admin Use
 * 
 * Imports learning articles and prompt playbooks from structured JSON
 * Validates, processes, and stores in MongoDB
 */

import 'dotenv/config';
import { getDb } from '../src/lib/mongodb';
import { marked } from 'marked';
import * as fs from 'fs';
import * as path from 'path';

interface ArticleInput {
  title: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  content: string; // Markdown content
  author?: string;
  estimatedReadTime?: number;
}

interface PlaybookInput {
  title: string;
  role: string;
  description: string;
  patterns: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  prompt: string;
  examples?: string[];
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

async function importArticles(articles: ArticleInput[]): Promise<void> {
  const db = await getDb();
  const collection = db.collection('learning_resources');

  console.log(`\n📚 Importing ${articles.length} learning articles...\n`);

  let imported = 0;
  let skipped = 0;

  for (const article of articles) {
    try {
      const slug = generateSlug(article.title);
      
      // Check if already exists
      const existing = await collection.findOne({ slug });
      if (existing) {
        console.log(`⏭️  Skipped: "${article.title}" (already exists)`);
        skipped++;
        continue;
      }

      // Convert markdown to HTML
      const contentHtml = await marked(article.content);
      
      // Calculate read time if not provided
      const readTime = article.estimatedReadTime || estimateReadTime(article.content);

      // Prepare document
      const doc = {
        title: article.title,
        slug,
        category: article.category,
        level: article.level,
        tags: article.tags,
        content: article.content,
        contentHtml,
        author: article.author || 'Engify Team',
        estimatedReadTime: readTime,
        status: 'active',
        featured: false,
        views: 0,
        likes: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        seo: {
          metaTitle: article.title,
          metaDescription: article.content.substring(0, 160),
          keywords: article.tags,
        },
      };

      await collection.insertOne(doc);
      console.log(`✅ Imported: "${article.title}" (${readTime} min read)`);
      imported++;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to import "${article.title}":`, errorMessage);
    }
  }

  console.log(`\n📊 Articles Summary:`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
}

async function importPlaybooks(playbooks: PlaybookInput[]): Promise<void> {
  const db = await getDb();
  const collection = db.collection('prompt_playbooks');

  console.log(`\n🎯 Importing ${playbooks.length} prompt playbooks...\n`);

  let imported = 0;
  let skipped = 0;

  for (const playbook of playbooks) {
    try {
      const slug = generateSlug(playbook.title);
      
      // Check if already exists
      const existing = await collection.findOne({ slug });
      if (existing) {
        console.log(`⏭️  Skipped: "${playbook.title}" (already exists)`);
        skipped++;
        continue;
      }

      // Prepare document
      const doc = {
        title: playbook.title,
        slug,
        role: playbook.role,
        description: playbook.description,
        patterns: playbook.patterns,
        level: playbook.level,
        tags: playbook.tags,
        prompt: playbook.prompt,
        examples: playbook.examples || [],
        status: 'active',
        featured: false,
        usageCount: 0,
        rating: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await collection.insertOne(doc);
      console.log(`✅ Imported: "${playbook.title}" (${playbook.role})`);
      imported++;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to import "${playbook.title}":`, errorMessage);
    }
  }

  console.log(`\n📊 Playbooks Summary:`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
}

async function importFromFile(filePath: string): Promise<void> {
  console.log(`\n🔄 Loading content from: ${filePath}\n`);

  const fullPath = path.resolve(filePath);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }

  const fileContent = fs.readFileSync(fullPath, 'utf-8');
  const data = JSON.parse(fileContent);

  if (data.articles && Array.isArray(data.articles)) {
    await importArticles(data.articles);
  }

  if (data.playbooks && Array.isArray(data.playbooks)) {
    await importPlaybooks(data.playbooks);
  }

  console.log(`\n🎉 Import complete!`);
  process.exit(0);
}

// CLI Usage
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
📥 Bulk Content Importer

Usage:
  pnpm tsx scripts/import-content-bulk.ts <json-file-path>

Example:
  pnpm tsx scripts/import-content-bulk.ts ./content-import.json

JSON Format:
{
  "articles": [
    {
      "title": "Article Title",
      "category": "prompt-engineering",
      "level": "intermediate",
      "tags": ["tag1", "tag2"],
      "content": "Full markdown content here..."
    }
  ],
  "playbooks": [
    {
      "title": "Playbook Title",
      "role": "Engineer",
      "description": "Brief description",
      "patterns": ["persona", "few-shot"],
      "level": "intermediate",
      "tags": ["tag1", "tag2"],
      "prompt": "Full prompt template here..."
    }
  ]
}
  `);
  process.exit(1);
}

const filePath = args[0];
importFromFile(filePath).catch((error) => {
  console.error('\n❌ Import failed:', error.message);
  process.exit(1);
});
