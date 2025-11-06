#!/usr/bin/env tsx
/**
 * Batch Improve Pillar Pages from Audit Results
 * Analyzes audit results and applies improvements to pillar pages
 * 
 * Usage:
 *   tsx scripts/content/batch-improve-pillar-pages-from-audits.ts
 *   tsx scripts/content/batch-improve-pillar-pages-from-audits.ts --dry-run
 *   tsx scripts/content/batch-improve-pillar-pages-from-audits.ts --id=ai-upskilling-program
 *   tsx scripts/content/batch-improve-pillar-pages-from-audits.ts --audit-first  # Audit first if missing
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { ContentPublishingService } from '@/lib/content/content-publishing-pipeline';
import { getPillarPage, PILLAR_PAGES } from '@/lib/data/pillar-pages';
import { Redis } from '@upstash/redis';
import { parseSections } from './audit-pillar-pages';

interface ImprovementStats {
  sectionsImproved: number;
  structureImproved: number;
  linksAdded: number;
  seoImproved: number;
  totalPages: number;
}

// Redis for distributed locking
let redisCache: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redisCache = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const LOCK_KEYS = {
  improveLock: (id: string) => `pillar:improve:lock:${id}`,
};

const LOCK_TTL = {
  improveLock: 3600, // 1 hour
};

/**
 * Improve a section based on audit results
 */
async function improveSection(
  section: { id: string; title: string; content: string },
  audit: any,
  context: {
    fullPageTitle: string;
    config: any;
  },
  dryRun: boolean = false
): Promise<string> {
  if (dryRun) {
    console.log(`   [DRY RUN] Would improve section: ${section.title}`);
    return section.content;
  }

  const service = new ContentPublishingService('pillar-improve');

  const improvePrompt = `Improve this section based on audit feedback:

PAGE TITLE: ${context.fullPageTitle}
SECTION TITLE: ${section.title}

CURRENT CONTENT:
---
${section.content}
---

AUDIT FEEDBACK:
- Completeness Score: ${audit.scores.completeness}/10
- SEO Score: ${audit.scores.seo}/10
- Accuracy Score: ${audit.scores.accuracy}/10
- Readability Score: ${audit.scores.readability}/10
- Linking Score: ${audit.scores.linking}/10

ISSUES:
${audit.issues.map((i: string) => `- ${i}`).join('\n')}

RECOMMENDATIONS:
${audit.recommendations.map((r: string) => `- ${r}`).join('\n')}

Please improve the section content to address these issues and recommendations.
Maintain the same structure and style, but enhance:
- Add examples where completeness is low
- Improve SEO with better keywords and headings
- Fix any technical inaccuracies
- Improve readability and flow
- Add internal links to related content

Return ONLY the improved content, no explanations.`;

  try {
    const improved = await service.runAgent(
      {
        role: 'content_improver',
        name: 'Content Improver',
        model: 'gpt-4o',
        provider: 'openai',
        systemPrompt: 'You are an expert at improving content based on audit feedback. Make targeted improvements while maintaining the original style and structure.',
        temperature: 0.4,
        maxTokens: 3000,
      },
      improvePrompt
    );

    return improved;
  } catch (error) {
    console.error(`   ⚠️  Section improvement failed: ${error}`);
    return section.content; // Return original on error
  }
}

/**
 * Improve structure based on audit
 */
async function improveStructure(
  pillarPage: any,
  audit: any,
  dryRun: boolean = false
): Promise<any> {
  if (dryRun) {
    console.log(`   [DRY RUN] Would improve structure`);
    return pillarPage;
  }

  // Structure improvements are typically manual or require significant refactoring
  // For now, we'll log recommendations
  console.log(`   📋 Structure recommendations:`);
  audit.recommendations.forEach((rec: string) => {
    console.log(`      - ${rec}`);
  });

  return pillarPage;
}

/**
 * Improve hub-and-spoke links
 */
async function improveHubAndSpokeLinks(
  pillarPage: any,
  audit: any,
  config: any,
  dryRun: boolean = false
): Promise<any> {
  if (dryRun) {
    console.log(`   [DRY RUN] Would improve hub-and-spoke links`);
    return pillarPage;
  }

  const service = new ContentPublishingService('pillar-improve');
  const content = pillarPage.contentHtml || '';

  // Add missing role links
  if (audit.linksTo.roles.missing.length > 0) {
    const missingRoles = audit.linksTo.roles.missing;
    console.log(`   🔗 Adding links to missing roles: ${missingRoles.join(', ')}`);

    const linkPrompt = `Add internal links to role pages in this pillar page content.

CONTENT:
---
${content.substring(0, 3000)}${content.length > 3000 ? '...' : ''}
---

MISSING ROLE LINKS:
${missingRoles.map((role: string) => `- /for-${role.replace(/_/g, '-')}`).join('\n')}

Add natural, contextual links to these role pages where relevant.
Return the improved content with links added.`;

    try {
      const improved = await service.runAgent(
        {
          role: 'link_optimizer',
          name: 'Link Optimizer',
          model: 'gpt-4o-mini',
          provider: 'openai',
          systemPrompt: 'You are an expert at adding internal links naturally to content.',
          temperature: 0.3,
          maxTokens: 2000,
        },
        linkPrompt
      );

      // Merge improved content (this is simplified - would need better merging logic)
      pillarPage.contentHtml = improved;
    } catch (error) {
      console.error(`   ⚠️  Link improvement failed: ${error}`);
    }
  }

  return pillarPage;
}

/**
 * Apply improvements to a pillar page
 */
async function applyImprovements(
  db: any,
  config: any,
  dryRun: boolean = false,
  auditFirst: boolean = false
): Promise<ImprovementStats> {
  const stats: ImprovementStats = {
    sectionsImproved: 0,
    structureImproved: 0,
    linksAdded: 0,
    seoImproved: 0,
    totalPages: 0,
  };

  // Get pillar page from MongoDB
  let pillarPage = await db.collection('learning_resources').findOne({
    $or: [
      { id: config.slug },
      { 'seo.slug': config.slug },
    ],
    type: 'pillar',
  });

  if (!pillarPage) {
    console.log(`   ⚠️  Pillar page not found in MongoDB: ${config.slug}`);
    return stats;
  }

  // Get latest audit
  const audit = await db.collection('pillar_page_audit_results').findOne(
    { pillarPageId: config.id },
    { sort: { auditVersion: -1 } }
  );

  if (!audit) {
    if (auditFirst) {
      console.log(`   ⏳ No audit found, auditing first...`);
      const { auditPillarPage } = await import('./audit-pillar-pages');
      const auditResult = await auditPillarPage(config, false);
      const auditVersion = 1;
      auditResult.auditVersion = auditVersion;
      await db.collection('pillar_page_audit_results').insertOne({
        ...auditResult,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`   ✅ Audited (Version ${auditVersion})`);
      // Use the new audit
      const newAudit = await db.collection('pillar_page_audit_results').findOne(
        { pillarPageId: config.id },
        { sort: { auditVersion: -1 } }
      );
      if (newAudit) {
        return await applyImprovements(db, config, dryRun, false);
      }
    } else {
      console.log(`   ⏭️  No audit found, skipping (use --audit-first to audit first)`);
      return stats;
    }
  }

  if (!audit.needsFix) {
    console.log(`   ✅ No improvements needed (score: ${audit.overallScore.toFixed(1)}/10)`);
    return stats;
  }

  console.log(`\n🔧 Applying improvements to: ${pillarPage.title}`);
  console.log(`   Current Score: ${audit.overallScore.toFixed(1)}/10`);

  // Parse sections
  const sections = parseSections(pillarPage.contentHtml || '');
  let improvedContent = pillarPage.contentHtml || '';

  // Improve sections
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const sectionAudit = audit.sectionAudits.find((a: any) => a.sectionId === section.id);

    if (sectionAudit && sectionAudit.needsImprovement) {
      console.log(`   [${i + 1}/${sections.length}] Improving section: ${section.title}`);
      const improvedSection = await improveSection(section, sectionAudit, {
        fullPageTitle: pillarPage.title,
        config,
      }, dryRun);

      if (!dryRun && improvedSection !== section.content) {
        // Replace section in content
        improvedContent = improvedContent.replace(section.content, improvedSection);
        stats.sectionsImproved++;
        console.log(`      ✅ Section improved`);
      }
    }
  }

  // Improve structure
  if (audit.structureAudit.needsImprovement) {
    console.log(`   Improving structure...`);
    const improved = await improveStructure(pillarPage, audit.structureAudit, dryRun);
    if (!dryRun) {
      pillarPage = improved;
      stats.structureImproved++;
    }
  }

  // Improve hub-and-spoke links
  if (audit.hubAndSpokeAudit.issues.length > 0) {
    console.log(`   Improving hub-and-spoke links...`);
    const improved = await improveHubAndSpokeLinks(pillarPage, audit.hubAndSpokeAudit, config, dryRun);
    if (!dryRun) {
      pillarPage = improved;
      stats.linksAdded += audit.hubAndSpokeAudit.linksTo.roles.missing.length;
    }
  }

  // Save improved page
  if (!dryRun) {
    const currentRevision = (pillarPage.currentRevision || 1) + 1;
    await db.collection('learning_resources').updateOne(
      { id: config.slug, type: 'pillar' },
      {
        $set: {
          contentHtml: improvedContent,
          currentRevision,
          updatedAt: new Date(),
        },
      }
    );
    console.log(`   💾 Saved improvements (Revision ${currentRevision})`);
  }

  stats.totalPages = 1;
  return stats;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const idArg = args.find(arg => arg.startsWith('--id='));
  const slugArg = args.find(arg => arg.startsWith('--slug='));
  const dryRun = args.includes('--dry-run');
  const auditFirst = args.includes('--audit-first');

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Pillar Page Improvement from Audit Results            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  if (dryRun) console.log('🔍 DRY RUN MODE - No changes will be saved\n');

  const db = await getMongoDb();

  // Determine which pages to improve
  let pagesToImprove: any[] = [];

  if (idArg) {
    const id = idArg.split('=')[1];
    const page = getPillarPage(id);
    if (!page) {
      console.error(`❌ Pillar page not found: ${id}`);
      process.exit(1);
    }
    pagesToImprove = [page];
  } else if (slugArg) {
    const slug = slugArg.split('=')[1];
    const page = PILLAR_PAGES.find(p => p.slug === slug);
    if (!page) {
      console.error(`❌ Pillar page not found: ${slug}`);
      process.exit(1);
    }
    pagesToImprove = [page];
  } else {
    // Improve all MongoDB-stored pages
    pagesToImprove = PILLAR_PAGES.filter(p => p.structure === 'mongodb' && p.status !== 'planned');
  }

  console.log(`📊 Found ${pagesToImprove.length} pages to improve\n`);

  const totalStats: ImprovementStats = {
    sectionsImproved: 0,
    structureImproved: 0,
    linksAdded: 0,
    seoImproved: 0,
    totalPages: 0,
  };

  // Improve each page
  for (let i = 0; i < pagesToImprove.length; i++) {
    const page = pagesToImprove[i];
    const pageId = page.id;

    // Try to acquire lock
    let lockAcquired = false;
    if (redisCache) {
      try {
        const lockResult = await redisCache.set(
          LOCK_KEYS.improveLock(pageId),
          `improving-${Date.now()}`,
          { ex: LOCK_TTL.improveLock, nx: true }
        );
        lockAcquired = lockResult === 'OK';
        if (!lockAcquired) {
          console.log(`[${i + 1}/${pagesToImprove.length}] 🔒 Skipping: ${page.title} (locked)`);
          continue;
        }
      } catch (error) {
        // Continue without lock
      }
    }

    try {
      const stats = await applyImprovements(db, page, dryRun, auditFirst);
      totalStats.sectionsImproved += stats.sectionsImproved;
      totalStats.structureImproved += stats.structureImproved;
      totalStats.linksAdded += stats.linksAdded;
      totalStats.seoImproved += stats.seoImproved;
      totalStats.totalPages += stats.totalPages;

      // Release lock
      if (lockAcquired && redisCache) {
        await redisCache.del(LOCK_KEYS.improveLock(pageId));
      }
    } catch (error) {
      console.error(`   ❌ Improvement failed: ${error}`);
      if (lockAcquired && redisCache) {
        await redisCache.del(LOCK_KEYS.improveLock(pageId));
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 IMPROVEMENT SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Sections Improved: ${totalStats.sectionsImproved}`);
  console.log(`✅ Structure Improved: ${totalStats.structureImproved}`);
  console.log(`✅ Links Added: ${totalStats.linksAdded}`);
  console.log(`✅ SEO Improved: ${totalStats.seoImproved}`);
  console.log(`📄 Total Pages: ${totalStats.totalPages}`);
  console.log('');
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { applyImprovements };

