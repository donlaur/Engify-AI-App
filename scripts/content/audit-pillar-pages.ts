#!/usr/bin/env tsx
/**
 * Audit Pillar Pages with Section-Based Processing
 * 
 * Reviews pillar pages using multi-agent system with section-based auditing
 * for large content (8,000-10,000 words).
 * 
 * Usage:
 *   tsx scripts/content/audit-pillar-pages.ts
 *   tsx scripts/content/audit-pillar-pages.ts --id=ai-upskilling-program
 *   tsx scripts/content/audit-pillar-pages.ts --slug=ai-first-engineering-organization
 *   tsx scripts/content/audit-pillar-pages.ts --quick  # Quick mode: fewer agents
 *   tsx scripts/content/audit-pillar-pages.ts --include-planned  # Audit planned pages too
 *   tsx scripts/content/audit-pillar-pages.ts --target-version=1  # Audit to version 1
 * 
 * NOTE: This script ONLY does SCORING. It saves audit results to pillar_page_audit_results collection.
 * To apply improvements, use: tsx scripts/content/batch-improve-pillar-pages-from-audits.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { ContentPublishingService } from '@/lib/content/content-publishing-pipeline';
import { getPillarPage, PILLAR_PAGES, getPlannedPillarPages } from '@/lib/data/pillar-pages';
import { Redis } from '@upstash/redis';

interface SectionAuditResult {
  sectionId: string;
  sectionTitle: string;
  scores: {
    completeness: number;
    seo: number;
    accuracy: number;
    readability: number;
    linking: number;
  };
  issues: string[];
  recommendations: string[];
  needsImprovement: boolean;
}

interface StructureAuditResult {
  overallScore: number;
  issues: string[];
  recommendations: string[];
  needsImprovement: boolean;
}

interface HubAndSpokeAuditResult {
  linksTo: {
    roles: { count: number; missing: string[] };
    prompts: { count: number; missing: string[] };
    patterns: { count: number; missing: string[] };
    articles: { count: number; missing: string[] };
  };
  linksFrom: {
    roles: { count: number; expected: number };
    prompts: { count: number; expected: number };
    patterns: { count: number; expected: number };
  };
  issues: string[];
  recommendations: string[];
}

interface PillarPageAuditResult {
  pillarPageId: string;
  slug: string;
  auditVersion: number;
  auditDate: Date;
  sectionAudits: SectionAuditResult[];
  structureAudit: StructureAuditResult;
  hubAndSpokeAudit: HubAndSpokeAuditResult;
  overallScore: number;
  needsFix: boolean;
  auditedAt: Date;
  auditedBy: string;
}

// Redis for distributed locking
let redisCache: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redisCache = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const CACHE_KEYS = {
  auditLock: (id: string) => `pillar:audit:lock:${id}`,
};

const CACHE_TTL = {
  auditLock: 3600, // 1 hour
};

/**
 * Parse sections from markdown content
 */
function parseSections(content: string): Array<{ id: string; title: string; content: string; order: number }> {
  const sections: Array<{ id: string; title: string; content: string; order: number }> = [];
  const lines = content.split('\n');
  let currentSection: { id: string; title: string; content: string; order: number } | null = null;
  let order = 0;

  for (const line of lines) {
    // Match H2 headings (## Title)
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }
      // Start new section
      const title = h2Match[1].trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      currentSection = {
        id,
        title,
        content: line + '\n',
        order: order++,
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }

  // Add last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Audit a single section
 */
async function auditSection(
  section: { id: string; title: string; content: string },
  context: {
    fullPageTitle: string;
    config: any;
  },
  quickMode: boolean = false
): Promise<SectionAuditResult> {
  const service = new ContentPublishingService('pillar-audit');

  const auditPrompt = `Audit this section from a pillar page:

PAGE TITLE: ${context.fullPageTitle}
SECTION TITLE: ${section.title}

SECTION CONTENT:
---
${section.content.substring(0, 2000)}${section.content.length > 2000 ? '...' : ''}
---

Evaluate this section on:
1. Completeness (depth, examples, actionable content) - 0-10
2. SEO (keywords, headings, meta) - 0-10
3. Technical Accuracy - 0-10
4. Readability (tone, clarity, flow) - 0-10
5. Internal Linking (links to related content) - 0-10

Respond in JSON format:
{
  "completeness": <number>,
  "seo": <number>,
  "accuracy": <number>,
  "readability": <number>,
  "linking": <number>,
  "issues": ["issue1", "issue2"],
  "recommendations": ["rec1", "rec2"]
}`;

  try {
    // Use Content Generator agent for comprehensive review
    const review = await service.runAgent(
      {
        role: 'content_reviewer',
        name: 'Content Reviewer',
        model: 'gpt-4o',
        provider: 'openai',
        systemPrompt: 'You are an expert content auditor. Provide detailed, actionable feedback.',
        temperature: 0.3,
        maxTokens: 1500,
      },
      auditPrompt
    );

    // Parse JSON response
    const jsonMatch = review.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const avgScore = (
        (parsed.completeness || 5) +
        (parsed.seo || 5) +
        (parsed.accuracy || 5) +
        (parsed.readability || 5) +
        (parsed.linking || 5)
      ) / 5;

      return {
        sectionId: section.id,
        sectionTitle: section.title,
        scores: {
          completeness: parsed.completeness || 5,
          seo: parsed.seo || 5,
          accuracy: parsed.accuracy || 5,
          readability: parsed.readability || 5,
          linking: parsed.linking || 5,
        },
        issues: parsed.issues || [],
        recommendations: parsed.recommendations || [],
        needsImprovement: avgScore < 7,
      };
    }
  } catch (error) {
    console.error(`   ⚠️  Section audit failed: ${error}`);
  }

  // Fallback if audit fails
  return {
    sectionId: section.id,
    sectionTitle: section.title,
    scores: {
      completeness: 5,
      seo: 5,
      accuracy: 5,
      readability: 5,
      linking: 5,
    },
    issues: ['Audit failed - manual review needed'],
    recommendations: ['Review section manually'],
    needsImprovement: true,
  };
}

/**
 * Audit page structure
 */
async function auditStructure(
  pillarPage: any,
  sectionAudits: SectionAuditResult[]
): Promise<StructureAuditResult> {
  const service = new ContentPublishingService('pillar-audit');

  const auditPrompt = `Audit the overall structure of this pillar page:

TITLE: ${pillarPage.title}
DESCRIPTION: ${pillarPage.description}
WORD COUNT: ${pillarPage.wordCount || 0}
SECTIONS: ${sectionAudits.length}

SECTION SCORES:
${sectionAudits.map(s => `- ${s.sectionTitle}: ${((s.scores.completeness + s.scores.seo + s.scores.accuracy + s.scores.readability + s.scores.linking) / 5).toFixed(1)}/10`).join('\n')}

Evaluate:
1. Overall structure quality (TOC, navigation, flow)
2. Section organization and ordering
3. Cross-section transitions
4. Table of contents completeness
5. Schema markup readiness

Respond in JSON:
{
  "overallScore": <number 0-10>,
  "issues": ["issue1"],
  "recommendations": ["rec1"]
}`;

  try {
    const review = await service.runAgent(
      {
        role: 'structure_reviewer',
        name: 'Structure Reviewer',
        model: 'gpt-4o',
        provider: 'openai',
        systemPrompt: 'You are an expert at evaluating content structure and organization.',
        temperature: 0.3,
        maxTokens: 1000,
      },
      auditPrompt
    );

    const jsonMatch = review.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        overallScore: parsed.overallScore || 5,
        issues: parsed.issues || [],
        recommendations: parsed.recommendations || [],
        needsImprovement: (parsed.overallScore || 5) < 7,
      };
    }
  } catch (error) {
    console.error(`   ⚠️  Structure audit failed: ${error}`);
  }

  return {
    overallScore: 5,
    issues: ['Structure audit failed'],
    recommendations: ['Review structure manually'],
    needsImprovement: true,
  };
}

/**
 * Audit hub-and-spoke links
 */
async function auditHubAndSpokeLinks(
  pillarPage: any,
  config: any
): Promise<HubAndSpokeAuditResult> {
  const db = await getMongoDb();

  // Check links TO related content
  const hubAndSpoke = pillarPage.hubAndSpoke || {};
  const linksTo = hubAndSpoke.linksTo || {};

  // Check links FROM cluster content
  const relatedRoles = config.relatedRoles || [];
  const relatedTags = config.relatedTags || [];

  // Count actual links in content
  const content = pillarPage.contentHtml || '';
  const roleLinks = (content.match(/\/for-[a-z-]+/g) || []).length;
  const promptLinks = (content.match(/\/prompts\/[a-z0-9-]+/g) || []).length;
  const patternLinks = (content.match(/\/patterns\/[a-z0-9-]+/g) || []).length;

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check if expected roles are linked
  const missingRoles = relatedRoles.filter(role => {
    const roleSlug = role.replace(/_/g, '-');
    return !content.includes(`/for-${roleSlug}`);
  });

  if (missingRoles.length > 0) {
    issues.push(`Missing links to ${missingRoles.length} related role pages`);
    recommendations.push(`Add links to: ${missingRoles.join(', ')}`);
  }

  // Check if patterns are linked (should link to at least 5-10 patterns)
  if (patternLinks < 5) {
    issues.push(`Only ${patternLinks} pattern links found (recommended: 5-10+)`);
    recommendations.push('Add more pattern links throughout content');
  }

  return {
    linksTo: {
      roles: {
        count: roleLinks,
        missing: missingRoles,
      },
      prompts: {
        count: promptLinks,
        missing: [],
      },
      patterns: {
        count: patternLinks,
        missing: [],
      },
      articles: {
        count: 0,
        missing: [],
      },
    },
    linksFrom: {
      roles: {
        count: 0, // Would need to query role pages
        expected: relatedRoles.length,
      },
      prompts: {
        count: 0, // Would need to query prompts
        expected: 0,
      },
      patterns: {
        count: 0, // Would need to query patterns
        expected: 0,
      },
    },
    issues,
    recommendations,
  };
}

/**
 * Audit a pillar page
 */
async function auditPillarPage(
  config: any,
  quickMode: boolean = false
): Promise<PillarPageAuditResult> {
  const db = await getMongoDb();
  const pillarPage = await db.collection('learning_resources').findOne({
    id: config.slug,
    type: 'pillar',
  });

  if (!pillarPage) {
    throw new Error(`Pillar page not found: ${config.slug}`);
  }

  console.log(`\n📄 Auditing: ${pillarPage.title}`);
  console.log(`   Slug: ${config.slug}`);
  console.log(`   Word Count: ${pillarPage.wordCount || 0}`);

  // Parse sections from content
  const content = pillarPage.contentHtml || '';
  const sections = parseSections(content);
  console.log(`   Sections: ${sections.length}`);

  // Audit each section
  const sectionAudits: SectionAuditResult[] = [];
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    console.log(`   [${i + 1}/${sections.length}] Auditing section: ${section.title}`);
    const audit = await auditSection(section, {
      fullPageTitle: pillarPage.title,
      config,
    }, quickMode);
    sectionAudits.push(audit);
    const avgScore = (
      audit.scores.completeness +
      audit.scores.seo +
      audit.scores.accuracy +
      audit.scores.readability +
      audit.scores.linking
    ) / 5;
    console.log(`      Score: ${avgScore.toFixed(1)}/10 ${audit.needsImprovement ? '⚠️' : '✅'}`);
  }

  // Audit structure
  console.log(`   Auditing overall structure...`);
  const structureAudit = await auditStructure(pillarPage, sectionAudits);
  console.log(`      Score: ${structureAudit.overallScore.toFixed(1)}/10 ${structureAudit.needsImprovement ? '⚠️' : '✅'}`);

  // Audit hub-and-spoke links
  console.log(`   Auditing hub-and-spoke links...`);
  const hubAndSpokeAudit = await auditHubAndSpokeLinks(pillarPage, config);
  console.log(`      Links: ${hubAndSpokeAudit.linksTo.patterns.count} patterns, ${hubAndSpokeAudit.linksTo.roles.count} roles`);

  // Calculate overall score
  const sectionAvg = sectionAudits.length > 0
    ? sectionAudits.reduce((sum, s) => {
        const sectionScore = (
          s.scores.completeness +
          s.scores.seo +
          s.scores.accuracy +
          s.scores.readability +
          s.scores.linking
        ) / 5;
        return sum + sectionScore;
      }, 0) / sectionAudits.length
    : 5;

  const overallScore = (sectionAvg * 0.7 + structureAudit.overallScore * 0.3);
  const needsFix = overallScore < 7 || sectionAudits.some(s => s.needsImprovement) || structureAudit.needsImprovement;

  return {
    pillarPageId: config.id,
    slug: config.slug,
    auditVersion: 0, // Will be set based on existing audits
    auditDate: new Date(),
    sectionAudits,
    structureAudit,
    hubAndSpokeAudit,
    overallScore,
    needsFix,
    auditedAt: new Date(),
    auditedBy: 'system',
  };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const idArg = args.find(arg => arg.startsWith('--id='));
  const slugArg = args.find(arg => arg.startsWith('--slug='));
  const quickMode = args.includes('--quick');
  const includePlanned = args.includes('--include-planned');
  const targetVersionArg = args.find(arg => arg.startsWith('--target-version='));
  const targetVersion = targetVersionArg ? parseInt(targetVersionArg.split('=')[1]) : 1;

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        Pillar Page Audit System - Section-Based          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📋 Target Audit Version: ${targetVersion}`);
  if (quickMode) console.log(`⚡ Quick Mode: Enabled`);
  if (includePlanned) console.log(`📝 Including Planned Pages`);
  console.log('');

  const db = await getMongoDb();

  // Determine which pages to audit
  let pagesToAudit: any[] = [];

  if (idArg) {
    const id = idArg.split('=')[1];
    const page = getPillarPage(id);
    if (!page) {
      console.error(`❌ Pillar page not found: ${id}`);
      process.exit(1);
    }
    pagesToAudit = [page];
  } else if (slugArg) {
    const slug = slugArg.split('=')[1];
    const page = PILLAR_PAGES.find(p => p.slug === slug);
    if (!page) {
      console.error(`❌ Pillar page not found: ${slug}`);
      process.exit(1);
    }
    pagesToAudit = [page];
  } else {
    // Audit all complete pages, optionally include planned
    pagesToAudit = PILLAR_PAGES.filter(p => {
      if (p.status === 'complete') return true;
      if (includePlanned && p.status === 'planned') return true;
      return false;
    });
  }

  // Filter pages that need auditing
  const pagesNeedingAudit: any[] = [];
  for (const page of pagesToAudit) {
    // Only audit MongoDB-stored pages
    if (page.structure !== 'mongodb') {
      console.log(`⏭️  Skipping ${page.id} (static file, not MongoDB)`);
      continue;
    }

    const existingAudit = await db.collection('pillar_page_audit_results').findOne(
      { pillarPageId: page.id },
      { sort: { auditVersion: -1 } }
    );

    const currentVersion = existingAudit?.auditVersion || 0;
    if (currentVersion >= targetVersion) {
      console.log(`⏭️  Skipping ${page.id} (already at version ${currentVersion})`);
      continue;
    }

    pagesNeedingAudit.push(page);
  }

  console.log(`\n📊 Found ${pagesNeedingAudit.length} pages needing audit\n`);

  // Audit each page
  for (let i = 0; i < pagesNeedingAudit.length; i++) {
    const page = pagesNeedingAudit[i];
    const pageId = page.id;

    // Try to acquire lock
    let lockAcquired = false;
    if (redisCache) {
      try {
        const lockResult = await redisCache.set(
          CACHE_KEYS.auditLock(pageId),
          `auditing-${Date.now()}`,
          { ex: CACHE_TTL.auditLock, nx: true }
        );
        lockAcquired = lockResult === 'OK';
        if (!lockAcquired) {
          console.log(`[${i + 1}/${pagesNeedingAudit.length}] 🔒 Skipping: ${page.title} (locked)`);
          continue;
        }
      } catch (error) {
        // Continue without lock
      }
    }

    try {
      console.log(`[${i + 1}/${pagesNeedingAudit.length}] 🔍 ${page.title}`);

      const auditResult = await auditPillarPage(page, quickMode);

      // Get next audit version
      const existingAudit = await db.collection('pillar_page_audit_results').findOne(
        { pillarPageId: pageId },
        { sort: { auditVersion: -1 } }
      );
      const auditVersion = existingAudit ? (existingAudit.auditVersion || 0) + 1 : 1;

      auditResult.auditVersion = auditVersion;

      // Save audit result
      await db.collection('pillar_page_audit_results').insertOne({
        ...auditResult,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`   ✅ Audit complete: ${auditResult.overallScore.toFixed(1)}/10 (Version ${auditVersion})`);
      console.log(`   ${auditResult.needsFix ? '⚠️  Needs improvement' : '✅ Looks good'}`);

      // Release lock
      if (lockAcquired && redisCache) {
        await redisCache.del(CACHE_KEYS.auditLock(pageId));
      }
    } catch (error) {
      console.error(`   ❌ Audit failed: ${error}`);
      if (lockAcquired && redisCache) {
        await redisCache.del(CACHE_KEYS.auditLock(pageId));
      }
    }
  }

  console.log('\n✅ Audit complete!\n');
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { auditPillarPage, parseSections };

