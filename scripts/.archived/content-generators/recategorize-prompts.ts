#!/usr/bin/env tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Re-categorize prompts from overly broad "general" to specific categories
 * Based on content analysis and title keywords
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import('mongodb').then(async ({ MongoClient }) => {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db('engify');
  
  console.log('\n🔄 RE-CATEGORIZING PROMPTS\n');
  
  const generalPrompts = await db.collection('prompts').find({ category: 'general' }).toArray();
  
  console.log(`Found ${generalPrompts.length} prompts to recategorize\n`);
  
  let updated = 0;
  
  for (const prompt of generalPrompts) {
    const title = (prompt.title || '').toLowerCase();
    const content = (prompt.content || prompt.prompt || '').toLowerCase();
    const tags = prompt.tags || [];
    
    let newCategory = 'general'; // default
    
    // Categorization logic
    if (title.match(/code|function|class|api|component|generator|builder/) || 
        content.includes('generate code') || 
        tags.some((t: string) => ['code', 'api', 'component'].includes(t))) {
      newCategory = 'code-generation';
    } else if (title.match(/test|qa|bug|e2e|unit/) ||
               tags.some((t: string) => ['testing', 'qa', 'unit-tests', 'e2e'].includes(t))) {
      newCategory = 'testing';
    } else if (title.match(/architect|design|system|scalab/) ||
               tags.some((t: string) => ['architecture', 'system-design'].includes(t))) {
      newCategory = 'architecture';
    } else if (title.match(/review|feedback/) ||
               tags.includes('code-review')) {
      newCategory = 'code-review';
    } else if (title.match(/debug|fix|error|troubleshoot/) ||
               tags.includes('debugging')) {
      newCategory = 'debugging';
    } else if (title.match(/doc|document|api spec/) ||
               tags.includes('documentation')) {
      newCategory = 'documentation';
    } else if (title.match(/refactor|clean|improve code/) ||
               tags.includes('refactoring')) {
      newCategory = 'refactoring';
    } else if (title.match(/performance|optimi|speed/) ||
               tags.includes('performance')) {
      newCategory = 'performance';
    } else if (title.match(/security|auth|encrypt|vulner/) ||
               tags.includes('security')) {
      newCategory = 'security';
    } else if (title.match(/product|feature|roadmap|vision|strategy/) ||
               tags.some((t: string) => ['product', 'roadmap', 'strategy'].includes(t))) {
      newCategory = 'product';
    } else if (title.match(/design|ux|ui|wireframe|prototype/) ||
               tags.some((t: string) => ['design', 'ux', 'ui'].includes(t))) {
      newCategory = 'design';
    } else if (title.match(/leader|manage|team|1-on-1|retrospective/) ||
               tags.some((t: string) => ['leadership', 'team', 'management'].includes(t))) {
      newCategory = 'leadership';
    } else if (title.match(/marketing|campaign|content|seo/) ||
               tags.includes('marketing')) {
      newCategory = 'marketing';
    } else if (title.match(/sales|customer|prospect/) ||
               tags.includes('sales')) {
      newCategory = 'sales';
    }
    
    if (newCategory !== 'general') {
      console.log(`${updated + 1}. "${prompt.title}"`);
      console.log(`   general → ${newCategory}`);
      
      // Update in database
      await db.collection('prompts').updateOne(
        { _id: prompt._id },
        { $set: { category: newCategory, updatedAt: new Date() } }
      );
      
      updated++;
    }
  }
  
  console.log(`\n✅ Updated ${updated} prompts`);
  console.log(`   Remaining as general: ${generalPrompts.length - updated}\n`);
  
  await client.close();
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

