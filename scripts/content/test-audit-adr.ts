/**
 * Test audit for Architecture Decision Record (ADR) prompt
 * This script will audit doc-001, save the score, and prepare for revision
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { PromptPatternAuditor } from '@/scripts/content/audit-prompts-patterns';

async function testAudit() {
  console.log('🎯 Testing Audit for Architecture Decision Record (ADR)\n');
  
  const db = await getMongoDb();
  const auditor = new PromptPatternAuditor('system');
  
  // Find the prompt
  const prompt = await db.collection('prompts').findOne({
    $or: [
      { id: 'doc-001' },
      { slug: 'architecture-decision-record-adr' },
    ],
  });
  
  if (!prompt) {
    console.error('❌ Prompt not found');
    process.exit(1);
  }
  
  console.log(`✅ Found: "${prompt.title}"`);
  console.log(`   ID: ${prompt.id}`);
  console.log(`   Current Revision: ${prompt.currentRevision || 1}\n`);
  
  console.log('⏳ Running audit...\n');
  const startTime = Date.now();
  
  try {
    const auditResult = await auditor.auditPrompt(prompt);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 AUDIT RESULTS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log(`🎯 Overall Score: ${auditResult.overallScore}/10`);
    console.log(`   Status: ${auditResult.needsFix ? '⚠️  NEEDS FIX' : '✅ GOOD'}`);
    console.log(`   Duration: ${duration}s\n`);
    
    console.log('📈 Category Scores:');
    Object.entries(auditResult.categoryScores).forEach(([category, score]) => {
      const label = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(`   ${label}: ${score.toFixed(1)}/10`);
    });
    
    // Save to database
    await db.collection('prompt_audit_results').updateOne(
      { promptId: prompt.id },
      {
        $set: {
          promptId: prompt.id,
          promptTitle: prompt.title,
          overallScore: auditResult.overallScore,
          categoryScores: auditResult.categoryScores,
          agentReviews: auditResult.agentReviews,
          issues: auditResult.issues,
          recommendations: auditResult.recommendations,
          missingElements: auditResult.missingElements,
          needsFix: auditResult.needsFix,
          auditedAt: new Date(),
          auditedBy: 'system',
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    
    console.log('\n✅ Audit saved to database');
    console.log(`\n📝 Issues: ${auditResult.issues.length}`);
    console.log(`💡 Recommendations: ${auditResult.recommendations.length}`);
    console.log(`❌ Missing Elements: ${auditResult.missingElements.length}\n`);
    
    if (auditResult.issues.length > 0) {
      console.log('Top Issues:');
      auditResult.issues.slice(0, 5).forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    }
    
    if (auditResult.recommendations.length > 0) {
      console.log('\nTop Recommendations:');
      auditResult.recommendations.slice(0, 5).forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }
    
    return auditResult;
  } catch (error) {
    console.error('❌ Audit failed:', error);
    throw error;
  }
}

testAudit()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });


