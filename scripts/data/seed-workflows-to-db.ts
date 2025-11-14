/**
 * Seed Workflows to MongoDB
 * 
 * Reads from public/data/workflows.json and inserts into MongoDB
 * Non-destructive: Uses upsert to avoid duplicates
 * 
 * Run: pnpm tsx scripts/data/seed-workflows-to-db.ts
 */

// Bypass BUILD_MODE check for seed scripts
if (!process.env.VERCEL_ENV) {
  process.env.VERCEL_ENV = 'development';
}

import { getMongoDb } from '@/lib/db/mongodb';
import { validateWorkflowsJson } from '@/lib/workflows/workflow-schema';
import fs from 'fs/promises';
import path from 'path';

async function seedWorkflows() {
  try {
    console.log('📖 Loading workflows from JSON...');
    
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'workflows.json');
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const jsonData = JSON.parse(jsonContent);
    
    // Validate JSON structure
    const validatedData = validateWorkflowsJson(jsonData);
    console.log(`✅ Found ${validatedData.workflows.length} workflows in JSON\n`);

    console.log('Connecting to MongoDB...');
    const db = await getMongoDb();
    console.log('✅ Connected to MongoDB\n');
    const workflowsCollection = db.collection('workflows');

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const workflow of validatedData.workflows) {
      try {
        const workflowDoc = {
          id: `${workflow.category}-${workflow.slug}`,
          slug: workflow.slug,
          title: workflow.title,
          category: workflow.category,
          audience: workflow.audience,
          problemStatement: workflow.problemStatement,
          manualChecklist: workflow.manualChecklist,
          relatedResources: workflow.relatedResources || {},
          researchCitations: workflow.researchCitations || [],
          painPointIds: workflow.painPointIds || [],
          painPointKeywords: workflow.painPointKeywords || [],
          seoStrategy: workflow.seoStrategy,
          eEatSignals: workflow.eEatSignals,
          automationTeaser: workflow.automationTeaser,
          cta: workflow.cta,
          status: workflow.status || 'draft',
          updatedAt: new Date(),
        };

        // Upsert workflow (update if exists, insert if new)
        const result = await workflowsCollection.updateOne(
          { category: workflow.category, slug: workflow.slug },
          {
            $set: workflowDoc,
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true }
        );

        if (result.upsertedCount > 0) {
          inserted++;
          console.log(`  ✓ Inserted: ${workflow.title}`);
        } else if (result.modifiedCount > 0) {
          updated++;
          console.log(`  ↻ Updated: ${workflow.title}`);
        } else {
          console.log(`  ○ Unchanged: ${workflow.title}`);
        }
      } catch (error) {
        console.error(`  ✗ Error processing ${workflow.title}:`, error);
        skipped++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SEED SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Inserted: ${inserted}`);
    console.log(`↻ Updated: ${updated}`);
    console.log(`⚠️  Skipped: ${skipped}`);
    console.log(`📦 Total: ${validatedData.workflows.length}`);
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedWorkflows();

