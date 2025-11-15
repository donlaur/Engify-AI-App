/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from 'dotenv';
config({ path: '.env.local' });

import('mongodb').then(async ({ MongoClient }) => {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db('engify');
  
  console.log('\n🔍 ANALYZING "GENERAL" CATEGORY PROMPTS\n');
  console.log('=' + '='.repeat(70) + '\n');
  
  const generalPrompts = await db.collection('prompts').find({ category: 'general' }).toArray();
  
  console.log(`Found ${generalPrompts.length} prompts categorized as "general"\n`);
  
  // Analyze their actual content to suggest better categories
  const suggestions = new Map();
  
  generalPrompts.forEach((p: any, i: number) => {
    const title = p.title || 'Untitled';
    const content = (p.content || p.prompt || '').toLowerCase();
    const tags = p.tags || [];
    
    // Suggest category based on title and content keywords
    let suggestedCategory = 'general';
    
    if (title.match(/code|function|class|api|component/i) || content.includes('code') || tags.includes('code')) {
      suggestedCategory = 'code-generation';
    } else if (title.match(/test|qa|bug/i) || content.includes('test') || tags.includes('testing')) {
      suggestedCategory = 'testing';
    } else if (title.match(/architect|design|system/i) || content.includes('architecture')) {
      suggestedCategory = 'architecture';
    } else if (title.match(/review|feedback/i) || tags.includes('code-review')) {
      suggestedCategory = 'code-review';
    } else if (title.match(/debug|fix|error/i) || tags.includes('debugging')) {
      suggestedCategory = 'debugging';
    } else if (title.match(/doc|document/i) || tags.includes('documentation')) {
      suggestedCategory = 'documentation';
    } else if (title.match(/refactor|clean|improve/i) || tags.includes('refactoring')) {
      suggestedCategory = 'refactoring';
    } else if (title.match(/performance|optimi/i) || tags.includes('performance')) {
      suggestedCategory = 'performance';
    } else if (title.match(/security|auth|encrypt/i) || tags.includes('security')) {
      suggestedCategory = 'security';
    } else if (title.match(/product|feature|roadmap/i) || tags.includes('product')) {
      suggestedCategory = 'product';
    } else if (title.match(/design|ux|ui/i) || tags.includes('design')) {
      suggestedCategory = 'design';
    } else if (title.match(/leader|manage|team/i) || tags.includes('leadership')) {
      suggestedCategory = 'leadership';
    }
    
    suggestions.set(suggestedCategory, (suggestions.get(suggestedCategory) || 0) + 1);
    
    // Show first 20 with suggestions
    if (i < 20) {
      console.log(`${i + 1}. "${title}"`);
      console.log(`   Current: general → Suggested: ${suggestedCategory}`);
      console.log(`   Tags: [${tags.slice(0, 5).join(', ')}${tags.length > 5 ? '...' : ''}]`);
      console.log(`   ID: ${p._id}\n`);
    }
  });
  
  console.log('\n📊 Suggested Re-categorization:\n');
  Array.from(suggestions.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} prompts`);
    });
  
  console.log('\n✅ Analysis complete!\n');
  
  await client.close();
  process.exit(0);
});
