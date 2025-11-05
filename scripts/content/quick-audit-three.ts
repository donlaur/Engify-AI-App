#!/usr/bin/env tsx
/**
 * Quick audit of first 3 prompts - Quick mode (3 agents only)
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { PromptPatternAuditor } from './audit-prompts-patterns';

async function quickAuditThree() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Quick Audit - First 3 Prompts (3 Agents Only)          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  let db;
  try {
    console.log('📡 Connecting to database...');
    db = await getMongoDb();
    console.log('✅ Database connected\n');

    const auditor = new PromptPatternAuditor('system', { 
      quickMode: true, // Only 3 core agents
      skipExecutionTest: true, // Skip execution test
      useCache: true, // Enable caching
    });

    console.log('⚡⚡ QUICK MODE: Running only 3 core agents\n');

    // Get first 3 prompts
    console.log('📋 Fetching prompts...');
    const prompts = await db.collection('prompts').find({}).limit(3).toArray();
    console.log(`✅ Found ${prompts.length} prompts\n`);
    
    if (prompts.length === 0) {
      console.error('❌ No prompts found');
      if (db?.client) await db.client.close();
      process.exit(1);
    }

    console.log(`Found ${prompts.length} prompts to audit:\n`);
    prompts.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title || p.id} (ID: ${p.id})`);
    });
    console.log('');

  const results = [];

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    console.log(`\n[${i + 1}/${prompts.length}] Auditing: ${prompt.title || prompt.id}`);
    console.log('━'.repeat(60));
    
    try {
      const startTime = Date.now();
      console.log(`   ⏳ Starting audit...`);
      const auditResult = await auditor.auditPrompt(prompt);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`   ✅ Audit completed`);
      
      console.log(`✅ Completed in ${duration}s`);
      console.log(`   Overall Score: ${auditResult.overallScore}/10`);
      console.log(`   Status: ${auditResult.needsFix ? '⚠️  NEEDS FIX' : '✅ GOOD'}`);
      console.log(`   Completeness: ${auditResult.categoryScores.completeness.toFixed(1)}/10`);
      console.log(`   Engineering: ${auditResult.categoryScores.engineeringUsefulness.toFixed(1)}/10`);
      console.log(`   Issues: ${auditResult.issues.length} | Recommendations: ${auditResult.recommendations.length}`);
      
      // Save to database
      const existingAudit = await db.collection('prompt_audit_results').findOne(
        { promptId: prompt.id },
        { sort: { auditVersion: -1 } }
      );

      const auditVersion = existingAudit ? (existingAudit.auditVersion || 0) + 1 : 1;
      const auditDate = new Date();

      await db.collection('prompt_audit_results').insertOne({
        promptId: prompt.id,
        promptTitle: prompt.title,
        auditVersion,
        auditDate,
        overallScore: auditResult.overallScore,
        categoryScores: auditResult.categoryScores,
        agentReviews: auditResult.agentReviews,
        issues: auditResult.issues,
        recommendations: auditResult.recommendations,
        missingElements: auditResult.missingElements,
        needsFix: auditResult.needsFix,
        auditedAt: auditDate,
        auditedBy: 'system',
        createdAt: auditDate,
        updatedAt: auditDate,
      });

      console.log(`   💾 Saved to database (Version ${auditVersion})`);
      
      results.push({
        id: prompt.id,
        title: prompt.title,
        score: auditResult.overallScore,
        duration: parseFloat(duration),
      });
    } catch (error) {
      console.error(`❌ Error auditing ${prompt.title || prompt.id}:`, error);
      if (error instanceof Error) {
        console.error(`   Error message: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  if (results.length > 0) {
    results.forEach((r, i) => {
      console.log(`${i + 1}. ${r.title}`);
      console.log(`   Score: ${r.score}/10 | Duration: ${r.duration}s`);
    });
    
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    
    console.log(`\n📈 Average Score: ${avgScore.toFixed(1)}/10`);
    console.log(`⏱️  Average Duration: ${avgDuration.toFixed(1)}s per prompt`);
    console.log(`⏱️  Total Duration: ${totalDuration.toFixed(1)}s`);
  } else {
    console.log('⚠️  No results to display');
  }

  console.log('\n🔌 Closing database connection...');
  if (db?.client) {
    await db.client.close();
    console.log('✅ Database connection closed');
  }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    if (error instanceof Error) {
      console.error(`   Error message: ${error.message}`);
    }
    if (db?.client) {
      await db.client.close().catch(() => {});
    }
    throw error;
  }
}

quickAuditThree()
  .then(() => {
    console.log('\n✅ Quick audit completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Quick audit failed:', error);
    process.exit(1);
  });

