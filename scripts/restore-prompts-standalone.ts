#!/usr/bin/env tsx
/**
 * Restore Prompts from JSON to MongoDB - Standalone
 *
 * Direct MongoDB connection without build mode restrictions
 */

import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
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
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/engify';
  const client = new MongoClient(uri);
  
  try {
    console.log('🔄 Starting prompts restore...');
    
    // Read prompts from JSON
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'prompts.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const data: PromptsJson = JSON.parse(jsonContent);
    
    console.log(`📚 Found ${data.totalPrompts} prompts in JSON`);
    
    // Connect to MongoDB
    await client.connect();
    const db = client.db();
    
    // Clear existing prompts (if any)
    const existingCount = await db.collection('prompts').countDocuments();
    if (existingCount > 0) {
      console.log(`🗑️  Clearing ${existingCount} existing prompts...`);
      await db.collection('prompts').deleteMany({});
    }
    
    // Insert prompts - use string IDs if not valid ObjectId
    const promptsToInsert = data.prompts.map(prompt => {
      let id;
      try {
        // Try to convert to ObjectId
        id = new ObjectId(prompt.id);
      } catch {
        // Use string ID if not valid ObjectId
        id = prompt.id;
      }
      
      return {
        ...prompt,
        _id: id,
        createdAt: prompt.createdAt ? new Date(prompt.createdAt) : new Date(),
        updatedAt: prompt.updatedAt ? new Date(prompt.updatedAt) : new Date(),
      };
    });
    
    const result = await db.collection('prompts').insertMany(promptsToInsert);
    console.log(`✅ Inserted ${result.insertedCount} prompts into MongoDB`);
    
    // Verify
    const totalCount = await db.collection('prompts').countDocuments();
    console.log(`📊 Total prompts in MongoDB: ${totalCount}`);
    
    // Also restore patterns if they exist
    const patternsPath = path.join(process.cwd(), 'public', 'data', 'patterns.json');
    if (fs.existsSync(patternsPath)) {
      console.log('\n🔄 Restoring patterns...');
      const patternsData = JSON.parse(fs.readFileSync(patternsPath, 'utf-8'));
      
      const existingPatterns = await db.collection('patterns').countDocuments();
      if (existingPatterns > 0) {
        await db.collection('patterns').deleteMany({});
      }
      
      const patternsToInsert = patternsData.patterns.map((pattern: any) => {
        let id;
        try {
          id = new ObjectId(pattern.id);
        } catch {
          id = pattern.id;
        }
        
        return {
          ...pattern,
          _id: id,
          createdAt: pattern.createdAt ? new Date(pattern.createdAt) : new Date(),
          updatedAt: pattern.updatedAt ? new Date(pattern.updatedAt) : new Date(),
        };
      });
      
      const patternsResult = await db.collection('patterns').insertMany(patternsToInsert);
      console.log(`✅ Inserted ${patternsResult.insertedCount} patterns into MongoDB`);
    }
    
  } catch (error) {
    console.error('❌ Error restoring prompts:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run if called directly
if (require.main === module) {
  restorePrompts()
    .then(() => {
      console.log('✨ Prompts and patterns restored successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to restore prompts:', error);
      process.exit(1);
    });
}

export { restorePrompts };
