#!/usr/bin/env tsx
/**
 * Restore Prompts from JSON to MongoDB
 *
 * Restores prompts from public/data/prompts.json back to MongoDB
 */

import 'dotenv/config';
import { getDb } from '../src/lib/mongodb';
import fs from 'fs';
import path from 'path';

interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  role?: string | null;
  pattern?: string | null;
  slug?: string | null;
  tags?: string[];
  difficulty?: string;
  estimatedTime?: number;
  experienceLevel?: string;
  isPublic?: boolean;
  isFeatured?: boolean;
  active?: boolean;
  views?: number;
  favorites?: number;
  shares?: number;
  rating?: number;
  ratingCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface PromptsJson {
  version: string;
  generatedAt: string;
  totalPrompts: number;
  prompts: Prompt[];
}

async function restorePrompts(): Promise<void> {
  try {
    console.log('🔄 Starting prompts restore...');
    
    // Read prompts from JSON
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'prompts.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const data: PromptsJson = JSON.parse(jsonContent);
    
    console.log(`📚 Found ${data.totalPrompts} prompts in JSON`);
    
    // Connect to MongoDB
    const db = await getDb();
    
    // Clear existing prompts (if any)
    const existingCount = await db.collection('prompts').countDocuments();
    if (existingCount > 0) {
      console.log(`🗑️  Clearing ${existingCount} existing prompts...`);
      await db.collection('prompts').deleteMany({});
    }
    
    // Insert prompts with proper MongoDB ObjectIds
    const promptsToInsert = data.prompts.map(prompt => ({
      ...prompt,
      _id: prompt.id, // Use the existing ID as _id
      createdAt: prompt.createdAt ? new Date(prompt.createdAt) : new Date(),
      updatedAt: prompt.updatedAt ? new Date(prompt.updatedAt) : new Date(),
    }));
    
    const result = await db.collection('prompts').insertMany(promptsToInsert as any);
    console.log(`✅ Inserted ${result.insertedCount} prompts into MongoDB`);
    
    // Verify
    const totalCount = await db.collection('prompts').countDocuments();
    console.log(`📊 Total prompts in MongoDB: ${totalCount}`);
    
  } catch (error) {
    console.error('❌ Error restoring prompts:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  restorePrompts()
    .then(() => {
      console.log('✨ Prompts restored successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to restore prompts:', error);
      process.exit(1);
    });
}

export { restorePrompts };
