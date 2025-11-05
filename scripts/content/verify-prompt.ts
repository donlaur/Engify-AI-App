/**
 * Verify prompt enrichment data
 */
import { getMongoDb } from '@/lib/db/mongodb';

async function verifyPrompt() {
  const db = await getMongoDb();
  const prompt = await db.collection('prompts').findOne({
    $or: [
      { id: 'doc-001' },
      { slug: 'architecture-decision-record-adr' }
    ]
  });

  if (!prompt) {
    console.log('❌ Prompt not found in database');
    return;
  }

  console.log('✅ Prompt found:');
  console.log(`   ID: ${prompt.id}`);
  console.log(`   Title: ${prompt.title}`);
  console.log(`   Slug: ${prompt.slug || 'MISSING'}`);
  console.log(`   isPublic: ${prompt.isPublic ?? 'undefined (should be true or undefined)'}`);
  console.log(`   active: ${prompt.active ?? 'undefined (should be true or undefined)'}`);
  console.log(`   requiresAuth: ${prompt.requiresAuth ?? 'undefined'}`);
  console.log(`   isPremium: ${prompt.isPremium ?? 'undefined'}`);
  console.log('');
  console.log('📊 Enrichment Data:');
  console.log(`   caseStudies: ${prompt.caseStudies ? prompt.caseStudies.length : 0}`);
  console.log(`   useCases: ${prompt.useCases ? prompt.useCases.length : 0}`);
  console.log(`   examples: ${prompt.examples ? prompt.examples.length : 0}`);
  console.log(`   bestPractices: ${prompt.bestPractices ? prompt.bestPractices.length : 0}`);
  console.log(`   bestTimeToUse: ${prompt.bestTimeToUse ? 'YES' : 'NO'}`);
  console.log(`   recommendedModel: ${prompt.recommendedModel || 'NO'}`);
  console.log(`   seoKeywords: ${prompt.seoKeywords ? prompt.seoKeywords.length : 0}`);
  console.log(`   difficulty: ${prompt.difficulty || 'NO'}`);
  console.log(`   estimatedTime: ${prompt.estimatedTime || 'NO'}`);
}

verifyPrompt().catch(console.error);

