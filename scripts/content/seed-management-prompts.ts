#!/usr/bin/env tsx
/**
 * Seed Management Prompts to MongoDB
 * 
 * Seeds PIPs, conflict resolution, and facilitator guides from static files
 * 
 * Usage:
 *   pnpm exec tsx scripts/content/seed-management-prompts.ts
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';
import { performanceImprovementPlans } from '../../src/data/prompts/management/performance-improvement-plans';
import { conflictResolutionPrompts } from '../../src/data/prompts/management/conflict-resolution';
import { facilitatorGuides } from '../../src/data/prompts/management/facilitator-guides';

interface ManagementPrompt {
  title: string;
  description: string;
  category: string;
  role?: string;
  pattern?: string;
  tags: string[];
  content: string;
  isFeatured?: boolean;
  views?: number;
  rating?: number;
  ratingCount?: number;
}

function generateId(prefix: string, index: number): string {
  return `${prefix}-${String(index + 1).padStart(3, '0')}`;
}

function generateSlug(title: string, id: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100) + `-${id}`;
}

function convertToPromptFormat(prompt: ManagementPrompt, id: string): any {
  // Map 'management' category to 'general' if needed, or keep as 'management'
  // But PromptCategorySchema doesn't include 'management', so use 'general'
  const category = prompt.category === 'management' ? 'general' : prompt.category;
  
  // Map pattern 'craft' to a valid pattern, or use 'template'
  const pattern = prompt.pattern === 'craft' ? 'template' : (prompt.pattern || 'template');
  
  return {
    id,
    slug: generateSlug(prompt.title, id),
    title: prompt.title,
    description: prompt.description,
    content: prompt.content,
    category,
    role: prompt.role || 'engineering-manager',
    pattern,
    tags: prompt.tags || [],
    views: prompt.views || 0,
    rating: prompt.rating || 0,
    ratingCount: prompt.ratingCount || 0,
    isPublic: true,
    isFeatured: prompt.isFeatured || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function seedManagementPrompts() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.error('   Please set MONGODB_URI in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('engify');
    const promptsCollection = db.collection('prompts');

    // Convert all management prompts
    const allPrompts: any[] = [];

    // PIP prompts
    console.log(`📝 Processing ${performanceImprovementPlans.length} PIP prompts...`);
    performanceImprovementPlans.forEach((prompt, index) => {
      const id = generateId('pip', index);
      allPrompts.push(convertToPromptFormat(prompt as ManagementPrompt, id));
    });

    // Conflict resolution prompts
    console.log(`📝 Processing ${conflictResolutionPrompts.length} conflict resolution prompts...`);
    conflictResolutionPrompts.forEach((prompt, index) => {
      const id = generateId('conflict', index);
      allPrompts.push(convertToPromptFormat(prompt as ManagementPrompt, id));
    });

    // Facilitator guide prompts
    console.log(`📝 Processing ${facilitatorGuides.length} facilitator guide prompts...`);
    facilitatorGuides.forEach((prompt, index) => {
      const id = generateId('facilitator', index);
      allPrompts.push(convertToPromptFormat(prompt as ManagementPrompt, id));
    });

    console.log(`\n📊 Total management prompts: ${allPrompts.length}`);

    // Check for duplicates (by title)
    const existingPrompts = await promptsCollection.find({}).toArray();
    const existingTitles = new Set(existingPrompts.map((p: any) => p.title.toLowerCase()));
    
    const newPrompts = allPrompts.filter((p) => !existingTitles.has(p.title.toLowerCase()));
    const duplicates = allPrompts.filter((p) => existingTitles.has(p.title.toLowerCase()));

    if (duplicates.length > 0) {
      console.log(`⚠️  Found ${duplicates.length} duplicate prompts (by title):`);
      duplicates.forEach((p) => console.log(`   - ${p.title}`));
    }

    if (newPrompts.length === 0) {
      console.log('✅ All management prompts already exist in database');
      return;
    }

    // Insert new prompts
    console.log(`\n📥 Inserting ${newPrompts.length} new prompts...`);
    const result = await promptsCollection.insertMany(newPrompts);
    console.log(`✅ Inserted ${result.insertedCount} prompts`);

    // Show summary
    const summary = await promptsCollection.aggregate([
      { $match: { id: { $regex: /^(pip|conflict|facilitator)-/ } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray();

    console.log('\n📊 Management Prompts by Category:');
    summary.forEach((cat: any) => {
      console.log(`   ${cat._id}: ${cat.count}`);
    });

    const roleSummary = await promptsCollection.aggregate([
      { $match: { id: { $regex: /^(pip|conflict|facilitator)-/ } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray();

    console.log('\n👥 Management Prompts by Role:');
    roleSummary.forEach((role: any) => {
      console.log(`   ${role._id}: ${role.count}`);
    });

    console.log('\n✅ Management prompts seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding management prompts:', error);
    throw error;
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  seedManagementPrompts()
    .then(() => {
      console.log('🎉 Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed:', error);
      process.exit(1);
    });
}

export { seedManagementPrompts };

