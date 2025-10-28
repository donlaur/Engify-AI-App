#!/usr/bin/env tsx
/**
 * Migrate Learning Resources to MongoDB
 * 
 * - ACTIVE: Articles with full content (>100 chars) - LIVE on site
 * - INACTIVE: Title/description only - Hidden, backfill later
 * - Add SEO fields (meta, keywords, schema)
 * - Convert content to HTML
 */

import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'engify';
const COLLECTION = 'learning_resources';

interface LearningResource {
  id: string;
  title: string;
  description: string;
  content?: string;
  category: string;
  type: string;
  level: string;
  duration: string;
  tags: string[];
  featured?: boolean;
  order?: number;
  url?: string;
  source?: string;
  author?: string;
  // New fields
  status: 'active' | 'inactive';
  contentHtml?: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    slug: string;
    canonicalUrl: string;
    ogImage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  views: number;
  shares: number;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractKeywords(title: string, description: string, tags: string[]): string[] {
  const keywords = new Set<string>();
  
  // Add tags
  tags.forEach(tag => keywords.add(tag));
  
  // Extract from title
  title.toLowerCase().split(/\s+/).forEach(word => {
    if (word.length > 3) keywords.add(word);
  });
  
  // Common AI/ML keywords
  const aiKeywords = ['ai', 'llm', 'prompt', 'engineering', 'rag', 'agent', 'gpt', 'claude'];
  aiKeywords.forEach(kw => {
    if (title.toLowerCase().includes(kw) || description.toLowerCase().includes(kw)) {
      keywords.add(kw);
    }
  });
  
  return Array.from(keywords).slice(0, 10);
}

function convertToHtml(content: string): string {
  // Simple markdown-like to HTML conversion
  let html = content;
  
  // Paragraphs
  html = html.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n');
  
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre><code class="language-$1">$2</code></pre>');
  
  // Inline code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  
  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  
  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Lists
  html = html.replace(/^\- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  
  return html;
}

async function migrateResources() {
  console.log('🚀 Starting migration...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(DB_NAME);
    const collection = db.collection<LearningResource>(COLLECTION);
    
    // Clear existing data
    await collection.deleteMany({});
    console.log('🗑️  Cleared existing resources\n');
    
    // Load JSON files
    const files = [
      'src/data/learning-resources.json',
      'src/data/learning-resources-advanced.json',
      'src/data/learning-ai-agents.json',
      'src/data/learning-production-ai.json',
    ];
    
    let activeCount = 0;
    let inactiveCount = 0;
    const resources: LearningResource[] = [];
    
    for (const file of files) {
      const filePath = path.join(process.cwd(), file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${file}`);
        continue;
      }
      
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const items = Array.isArray(data) ? data : (data.resources || []);
      
      console.log(`📄 Processing ${file}: ${items.length} items`);
      
      for (const item of items) {
        const hasContent = item.content && item.content.length > 100;
        const status = hasContent ? 'active' : 'inactive';
        
        if (status === 'active') activeCount++;
        else inactiveCount++;
        
        const slug = generateSlug(item.title);
        const keywords = extractKeywords(item.title, item.description, item.tags || []);
        
        const resource: LearningResource = {
          ...item,
          status,
          contentHtml: hasContent ? convertToHtml(item.content) : undefined,
          seo: {
            metaTitle: `${item.title} | Engify.ai`,
            metaDescription: item.description.substring(0, 160),
            keywords,
            slug,
            canonicalUrl: `https://engify.ai/learn/${slug}`,
            ogImage: `https://engify.ai/og/${slug}.png`,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          publishedAt: hasContent ? new Date() : undefined,
          views: 0,
          shares: 0,
        };
        
        resources.push(resource);
      }
    }
    
    // Insert into MongoDB
    if (resources.length > 0) {
      await collection.insertMany(resources);
      console.log(`\n✅ Inserted ${resources.length} resources`);
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ ACTIVE (live): ${activeCount} articles`);
    console.log(`   ⏸️  INACTIVE (ideas): ${inactiveCount} articles`);
    console.log(`   📝 Total: ${resources.length} resources`);
    
    // Create indexes
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ 'seo.slug': 1 }, { unique: true });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ level: 1 });
    await collection.createIndex({ tags: 1 });
    await collection.createIndex({ featured: 1 });
    await collection.createIndex({ views: -1 });
    await collection.createIndex({ publishedAt: -1 });
    
    console.log(`\n✅ Created indexes`);
    
    // Show active resources
    console.log(`\n📚 Active Resources (ready for site):`);
    const active = await collection.find({ status: 'active' }).sort({ order: 1 }).toArray();
    active.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.title} (${r.category})`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✅ Migration complete!');
  }
}

migrateResources();
