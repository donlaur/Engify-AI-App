#!/usr/bin/env tsx
/**
 * Check audit status of prompts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';

async function checkAuditStatus() {
  const db = await getMongoDb();
  
  const prompts = await db.collection('prompts').find({}).toArray();
  const audits = await db.collection('prompt_audit_results').find({}).toArray();
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Prompt Audit Status Report                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`Total Prompts: ${prompts.length}`);
  console.log(`Total Audits: ${audits.length}\n`);
  
  const auditedIds = new Set(audits.map((a: any) => a.promptId));
  const unaudited = prompts.filter((p: any) => !auditedIds.has(p.id));
  
  console.log(`✅ Audited: ${audits.length}`);
  console.log(`❌ Unaudited: ${unaudited.length}\n`);
  
  if (audits.length > 0) {
    console.log('📊 Recent Audit Scores:');
    audits
      .sort((a: any, b: any) => (b.auditedAt?.getTime() || 0) - (a.auditedAt?.getTime() || 0))
      .slice(0, 10)
      .forEach((a: any) => {
        const status = a.needsFix ? '⚠️' : '✅';
        console.log(`  ${status} ${a.promptId}: ${a.overallScore}/10`);
      });
    console.log('');
  }
  
  // Score distribution
  const scoreRanges = {
    '0-3': audits.filter((a: any) => a.overallScore >= 0 && a.overallScore < 3).length,
    '3-5': audits.filter((a: any) => a.overallScore >= 3 && a.overallScore < 5).length,
    '5-7': audits.filter((a: any) => a.overallScore >= 5 && a.overallScore < 7).length,
    '7-9': audits.filter((a: any) => a.overallScore >= 7 && a.overallScore < 9).length,
    '9-10': audits.filter((a: any) => a.overallScore >= 9 && a.overallScore <= 10).length,
  };
  
  console.log('📈 Score Distribution:');
  Object.entries(scoreRanges).forEach(([range, count]) => {
    const bar = '█'.repeat(Math.floor((count / audits.length) * 50)) || '░';
    console.log(`  ${range.padEnd(6)}: ${count.toString().padStart(3)} ${bar}`);
  });
  console.log('');
  
  if (unaudited.length > 0) {
    console.log('⚠️  Unaudited Prompts (first 10):');
    unaudited.slice(0, 10).forEach((p: any, i: number) => {
      console.log(`  ${i + 1}. [${p.id}] ${p.title || 'Untitled'}`);
    });
    if (unaudited.length > 10) {
      console.log(`  ... and ${unaudited.length - 10} more`);
    }
  }
  
  // Low scoring prompts
  const lowScores = audits.filter((a: any) => a.overallScore < 5);
  if (lowScores.length > 0) {
    console.log('\n🔴 Low Scoring Prompts (< 5/10):');
    lowScores.forEach((a: any) => {
      console.log(`  ${a.promptId}: ${a.overallScore}/10 - Missing: ${a.missingElements?.slice(0, 3).join(', ') || 'none'}`);
    });
  }
}

checkAuditStatus()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

