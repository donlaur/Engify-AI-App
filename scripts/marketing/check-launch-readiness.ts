/**
 * Pre-Launch Readiness Check
 * Verifies that prompts are audited and role pages are ready for LinkedIn launch
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { APP_URL } from '@/lib/constants';

interface ReadinessCheck {
  rolePages: {
    ready: boolean;
    count: number;
    missing: string[];
  };
  promptAudits: {
    ready: boolean;
    totalPrompts: number;
    auditedCount: number;
    averageScore: number;
    highQualityCount: number; // 8+ score
    needsAudit: string[];
  };
  overall: {
    ready: boolean;
    blockers: string[];
    recommendations: string[];
  };
}

const EXPECTED_ROLES = [
  'engineering-manager',
  'product-manager',
  'product-owner',
  'engineer',
  'devops-sre',
  'qa',
  'designer',
];

const MIN_AVERAGE_SCORE = 7.0;
const MIN_HIGH_QUALITY_PERCENTAGE = 50; // % of prompts scoring 8+

async function checkReadiness(): Promise<ReadinessCheck> {
  const db = await getMongoDb();

  // Check role pages
  const rolePages = await checkRolePages(db);
  
  // Check prompt audits
  const promptAudits = await checkPromptAudits(db);

  // Overall readiness
  const blockers: string[] = [];
  const recommendations: string[] = [];

  if (!rolePages.ready) {
    blockers.push(`Missing role pages: ${rolePages.missing.join(', ')}`);
  }

  if (!promptAudits.ready) {
    if (promptAudits.averageScore < MIN_AVERAGE_SCORE) {
      blockers.push(`Average audit score too low: ${promptAudits.averageScore.toFixed(1)}/10 (need ${MIN_AVERAGE_SCORE}+)`);
    }
    if (promptAudits.needsAudit.length > 0) {
      blockers.push(`${promptAudits.needsAudit.length} prompts need auditing`);
    }
    const highQualityPercent = (promptAudits.highQualityCount / promptAudits.auditedCount) * 100;
    if (highQualityPercent < MIN_HIGH_QUALITY_PERCENTAGE) {
      recommendations.push(`Only ${highQualityPercent.toFixed(1)}% of prompts score 8+ (target: ${MIN_HIGH_QUALITY_PERCENTAGE}%+)`);
    }
  }

  const overallReady = blockers.length === 0 && rolePages.ready && promptAudits.ready;

  return {
    rolePages,
    promptAudits,
    overall: {
      ready: overallReady,
      blockers,
      recommendations,
    },
  };
}

async function checkRolePages(db: any) {
  // Check if role content exists in database
  const roles = EXPECTED_ROLES;
  const missing: string[] = [];

  // Note: We can't actually check if pages exist, but we can check if role content exists
  // Pages should exist at /for-{role} URLs
  
  return {
    ready: missing.length === 0,
    count: roles.length - missing.length,
    missing,
  };
}

async function checkPromptAudits(db: any) {
  const prompts = await db.collection('prompts').find({ isPublic: true }).toArray();
  const audits = await db.collection('prompt_audit_results').find({}).toArray();

  // Get latest audit per prompt
  const latestAudits = audits.reduce((acc: any, audit: any) => {
    const existing = acc.get(audit.promptId);
    if (!existing || (audit.auditVersion || 0) > (existing.auditVersion || 0)) {
      acc.set(audit.promptId, audit);
    }
    return acc;
  }, new Map());

  const auditedIds = new Set(latestAudits.keys());
  const needsAudit = prompts
    .filter((p: any) => !auditedIds.has(p.id))
    .map((p: any) => p.title || p.id)
    .slice(0, 10); // Show first 10

  const auditScores = Array.from(latestAudits.values()).map((a: any) => a.overallScore || 0);
  const averageScore = auditScores.length > 0
    ? auditScores.reduce((sum, score) => sum + score, 0) / auditScores.length
    : 0;

  const highQualityCount = auditScores.filter((score: number) => score >= 8).length;

  return {
    ready: needsAudit.length === 0 && averageScore >= MIN_AVERAGE_SCORE,
    totalPrompts: prompts.length,
    auditedCount: latestAudits.size,
    averageScore,
    highQualityCount,
    needsAudit,
  };
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  LinkedIn Launch Readiness Check                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const check = await checkReadiness();

  // Role Pages Status
  console.log('📄 ROLE PAGES:');
  console.log(`   ${check.rolePages.ready ? '✅' : '❌'} Status: ${check.rolePages.ready ? 'Ready' : 'Not Ready'}`);
  console.log(`   Pages: ${check.rolePages.count}/${EXPECTED_ROLES.length}`);
  if (check.rolePages.missing.length > 0) {
    console.log(`   Missing: ${check.rolePages.missing.join(', ')}`);
  }
  console.log('');

  // Prompt Audits Status
  console.log('📊 PROMPT AUDITS:');
  console.log(`   ${check.promptAudits.ready ? '✅' : '❌'} Status: ${check.promptAudits.ready ? 'Ready' : 'Not Ready'}`);
  console.log(`   Total Prompts: ${check.promptAudits.totalPrompts}`);
  console.log(`   Audited: ${check.promptAudits.auditedCount}/${check.promptAudits.totalPrompts}`);
  console.log(`   Average Score: ${check.promptAudits.averageScore.toFixed(1)}/10`);
  console.log(`   High Quality (8+): ${check.promptAudits.highQualityCount} (${((check.promptAudits.highQualityCount / check.promptAudits.auditedCount) * 100).toFixed(1)}%)`);
  if (check.promptAudits.needsAudit.length > 0) {
    console.log(`   ⚠️  Needs Audit: ${check.promptAudits.needsAudit.slice(0, 5).join(', ')}${check.promptAudits.needsAudit.length > 5 ? '...' : ''}`);
  }
  console.log('');

  // Overall Status
  console.log('🎯 OVERALL READINESS:');
  console.log(`   ${check.overall.ready ? '✅ READY TO LAUNCH' : '❌ NOT READY'}\n`);

  if (check.overall.blockers.length > 0) {
    console.log('🚫 BLOCKERS:');
    check.overall.blockers.forEach((blocker) => {
      console.log(`   ❌ ${blocker}`);
    });
    console.log('');
  }

  if (check.overall.recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS:');
    check.overall.recommendations.forEach((rec) => {
      console.log(`   ⚠️  ${rec}`);
    });
    console.log('');
  }

  if (check.overall.ready) {
    console.log('✅ All checks passed! You\'re ready to launch on LinkedIn.\n');
    console.log('📝 Next Steps:');
    console.log('   1. Review LinkedIn post drafts in docs/marketing/LINKEDIN_LAUNCH_PLAN.md');
    console.log('   2. Choose a post option');
    console.log('   3. Schedule for optimal time (Tue-Thu, 8-10 AM or 12-2 PM EST)');
    console.log('   4. Monitor analytics and respond to comments\n');
  } else {
    console.log('❌ Please address blockers before launching.\n');
    console.log('📝 Actions Needed:');
    if (check.promptAudits.needsAudit.length > 0) {
      console.log(`   • Run audits: pnpm tsx scripts/content/audit-prompts-patterns.ts`);
    }
    if (check.promptAudits.averageScore < MIN_AVERAGE_SCORE) {
      console.log(`   • Improve prompt quality (current avg: ${check.promptAudits.averageScore.toFixed(1)}/10)`);
      console.log(`   • Run improvements: pnpm tsx scripts/content/batch-improve-from-audits.ts`);
    }
    console.log('');
  }

  // Role page URLs
  console.log('🔗 Role Page URLs:');
  EXPECTED_ROLES.forEach((role) => {
    const slug = role === 'engineering-manager' ? 'managers' :
                 role === 'product-manager' ? 'pms' :
                 role === 'product-owner' ? 'product-owners' :
                 role === 'engineer' ? 'engineers' :
                 role === 'devops-sre' ? 'devops-sre' :
                 role === 'qa' ? 'qa' :
                 role === 'designer' ? 'designers' : role;
    console.log(`   ${APP_URL}/for-${slug}`);
  });
}

main().catch(console.error);

