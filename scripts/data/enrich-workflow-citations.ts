/**
 * Enrich Workflow Citations with Verified URLs
 * 
 * This script reads workflows.json and enriches research citations
 * with verified URLs from the verified-sources mapping.
 * 
 * Run: pnpm tsx scripts/data/enrich-workflow-citations.ts
 */

import { getVerifiedSourceUrl } from '@/lib/workflows/verified-sources';
import { validateWorkflowsJson } from '@/lib/workflows/workflow-schema';
import fs from 'fs/promises';
import path from 'path';

async function enrichCitations() {
  try {
    console.log('📖 Loading workflows from JSON...');
    
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'workflows.json');
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const jsonData = JSON.parse(jsonContent);
    
    // Validate JSON structure
    const validatedData = validateWorkflowsJson(jsonData);
    console.log(`✅ Found ${validatedData.workflows.length} workflows in JSON\n`);

    let enrichedCount = 0;
    let totalCitations = 0;

    // Enrich each workflow's citations
    for (const workflow of validatedData.workflows) {
      if (workflow.researchCitations && workflow.researchCitations.length > 0) {
        totalCitations += workflow.researchCitations.length;
        
        for (const citation of workflow.researchCitations) {
          // Check if citation already has a URL
          if (!citation.url) {
            const verifiedUrl = getVerifiedSourceUrl(citation.source);
            if (verifiedUrl) {
              citation.url = verifiedUrl;
              citation.verified = true;
              enrichedCount++;
              console.log(`  ✓ Enriched: ${citation.source}`);
            } else {
              console.log(`  ⚠️  No verified URL found for: ${citation.source}`);
            }
          }
        }
      }
    }

    // Write back to JSON
    await fs.writeFile(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');

    console.log('\n' + '='.repeat(60));
    console.log('📊 ENRICHMENT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Enriched: ${enrichedCount} citations`);
    console.log(`📦 Total citations: ${totalCitations}`);
    console.log(`📝 Workflows processed: ${validatedData.workflows.length}`);
    console.log('='.repeat(60) + '\n');

    console.log('💡 Next steps:');
    console.log('   1. Review the enriched citations in workflows.json');
    console.log('   2. Verify URLs are correct and accessible');
    console.log('   3. Add any missing sources to verified-sources.ts');
    console.log('   4. Run seed script to update MongoDB\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Enrichment failed:', error);
    process.exit(1);
  }
}

enrichCitations();

