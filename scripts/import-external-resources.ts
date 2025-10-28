#!/usr/bin/env tsx
/**
 * Import External Learning Resources
 * 
 * Adds curated external resources to MongoDB
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { MongoClient } from 'mongodb';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'engify';
const COLLECTION = 'learning_resources';

const externalResources = [
  {
    id: 'ext-portkey-low-resource',
    title: 'Prompt Engineering for Low-Resource Languages',
    description: 'Learn how to effectively prompt engineer for languages with limited training data and resources.',
    url: 'https://portkey.ai/blog/prompt-engineering-for-low-resource-languages/',
    category: 'advanced',
    type: 'article',
    level: 'advanced',
    duration: '8 min',
    tags: ['low-resource-languages', 'multilingual', 'advanced-techniques'],
    featured: false,
    status: 'active',
    source: 'Portkey.ai',
    author: 'Portkey Team',
  },
  {
    id: 'ext-google-what-is-pe',
    title: 'What is Prompt Engineering? - Google Cloud',
    description: 'Comprehensive introduction to prompt engineering from Google Cloud, covering fundamentals and best practices.',
    url: 'https://cloud.google.com/discover/what-is-prompt-engineering?hl=en',
    category: 'basics',
    type: 'guide',
    level: 'beginner',
    duration: '10 min',
    tags: ['fundamentals', 'google-cloud', 'introduction'],
    featured: true,
    status: 'active',
    source: 'Google Cloud',
    author: 'Google Cloud Team',
  },
  {
    id: 'ext-auditboard-ai-platform',
    title: 'AI Platform for Audit & Risk Management',
    description: 'Real-world application of AI in audit and compliance workflows, showing practical enterprise use cases.',
    url: 'https://auditboard.com/platform/ai',
    category: 'production',
    type: 'case-study',
    level: 'intermediate',
    duration: '6 min',
    tags: ['enterprise', 'audit', 'compliance', 'use-cases'],
    featured: false,
    status: 'active',
    source: 'AuditBoard',
    author: 'AuditBoard Team',
  },
  {
    id: 'ext-azure-evaluate-ai',
    title: 'Evaluate Generative AI Apps - Azure AI Foundry',
    description: 'Microsoft\'s guide to evaluating and testing generative AI applications in production environments.',
    url: 'https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/evaluate-generative-ai-app',
    category: 'production',
    type: 'guide',
    level: 'advanced',
    duration: '12 min',
    tags: ['evaluation', 'testing', 'azure', 'production', 'quality-assurance'],
    featured: true,
    status: 'active',
    source: 'Microsoft Learn',
    author: 'Microsoft Azure Team',
  },
  {
    id: 'ext-tableau-ai-pros-cons',
    title: 'AI Advantages and Disadvantages in Data Analytics',
    description: 'Balanced perspective on AI benefits and limitations in data visualization and analytics workflows.',
    url: 'https://www.tableau.com/data-insights/ai/advantages-disadvantages',
    category: 'basics',
    type: 'article',
    level: 'beginner',
    duration: '7 min',
    tags: ['data-analytics', 'pros-cons', 'tableau', 'business-intelligence'],
    featured: false,
    status: 'active',
    source: 'Tableau',
    author: 'Tableau Team',
  },
  {
    id: 'ext-bizway-data-viz',
    title: 'ChatGPT Prompts for Data Visualization',
    description: 'Practical prompts and techniques for creating dashboards and data visualizations using AI.',
    url: 'https://www.bizway.io/blog/chatgpt-prompts-for-data-visualization-and-dashboard-creation',
    category: 'patterns',
    type: 'tutorial',
    level: 'intermediate',
    duration: '9 min',
    tags: ['data-visualization', 'dashboards', 'chatgpt', 'prompts', 'visual-ai'],
    featured: true,
    status: 'active',
    source: 'Bizway',
    author: 'Bizway Team',
  },
  {
    id: 'ext-luzmo-chatgpt-viz',
    title: 'ChatGPT for Data Visualization - Complete Guide',
    description: 'Step-by-step guide to leveraging ChatGPT for creating compelling data visualizations and charts.',
    url: 'https://www.luzmo.com/blog/chatgpt-for-data-visualization',
    category: 'patterns',
    type: 'guide',
    level: 'intermediate',
    duration: '11 min',
    tags: ['data-visualization', 'chatgpt', 'charts', 'visual-ai', 'analytics'],
    featured: false,
    status: 'active',
    source: 'Luzmo',
    author: 'Luzmo Team',
  },
  {
    id: 'ext-optimizesmart-sql',
    title: 'AI Prompt Engineering for SQL Generation: 7 Lessons',
    description: 'Hard-won lessons on using AI to generate SQL queries effectively and safely.',
    url: 'https://www.optimizesmart.com/ai-prompt-engineering-for-sql-generation-7-lessons-i-learned/',
    category: 'engineering',
    type: 'article',
    level: 'intermediate',
    duration: '10 min',
    tags: ['sql', 'database', 'code-generation', 'lessons-learned'],
    featured: true,
    status: 'active',
    source: 'OptimizeSmart',
    author: 'Himanshu Sharma',
  },
  {
    id: 'ext-galaxy-sql-prompting',
    title: 'Prompt Engineering for SQL Generation - Glossary',
    description: 'Comprehensive glossary and reference guide for SQL generation using prompt engineering techniques.',
    url: 'https://www.getgalaxy.io/learn/glossary/prompt-engineering-for-sql-generation',
    category: 'engineering',
    type: 'reference',
    level: 'intermediate',
    duration: '6 min',
    tags: ['sql', 'database', 'glossary', 'reference'],
    featured: false,
    status: 'active',
    source: 'Galaxy',
    author: 'Galaxy Team',
  },
  {
    id: 'ext-prompting-guide-rag',
    title: 'RAG (Retrieval-Augmented Generation) Research',
    description: 'Academic and practical research on RAG systems, implementation patterns, and best practices.',
    url: 'https://www.promptingguide.ai/research/rag',
    category: 'advanced',
    type: 'research',
    level: 'advanced',
    duration: '15 min',
    tags: ['rag', 'retrieval', 'research', 'advanced-techniques'],
    featured: true,
    status: 'active',
    source: 'Prompting Guide',
    author: 'DAIR.AI',
  },
  {
    id: 'ext-moveo-rag-vs-finetuning',
    title: 'Fine-Tuning vs RAG vs Prompt Engineering',
    description: 'Comparison guide helping you choose between fine-tuning, RAG, and prompt engineering for your use case.',
    url: 'https://moveo.ai/blog/fine-tuning-rag-or-prompt-engineering',
    category: 'advanced',
    type: 'comparison',
    level: 'advanced',
    duration: '12 min',
    tags: ['rag', 'fine-tuning', 'comparison', 'decision-framework'],
    featured: true,
    status: 'active',
    source: 'Moveo.AI',
    author: 'Moveo Team',
  },
];

async function main() {
  console.log('📚 Importing External Learning Resources\n');
  console.log(`Adding ${externalResources.length} curated resources...\n`);

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);

    // Add metadata to each resource
    const resources = externalResources.map(resource => ({
      ...resource,
      seo: {
        metaTitle: `${resource.title} | Engify.ai`,
        metaDescription: resource.description,
        keywords: resource.tags,
        slug: resource.id,
        canonicalUrl: resource.url,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
      views: 0,
      shares: 0,
      isExternal: true,
    }));

    await collection.insertMany(resources);

    console.log(`✅ Successfully added ${resources.length} resources to MongoDB\n`);

    // Show what was added by category
    const byCategory: Record<string, number> = {};
    resources.forEach(r => {
      byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    });

    console.log('📊 Resources by Category:');
    Object.entries(byCategory).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });

    console.log('\n🎯 Featured Resources:');
    resources.filter(r => r.featured).forEach(r => {
      console.log(`   • ${r.title}`);
    });

    console.log('\n🔍 New Topics Added:');
    const uniqueTags = [...new Set(resources.flatMap(r => r.tags))];
    console.log(`   ${uniqueTags.join(', ')}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }

  console.log('\n🎉 Done! External resources are now available in the learning library.');
}

main();
