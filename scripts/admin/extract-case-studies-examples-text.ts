#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Extract Text from Case Studies and Examples
 * 
 * Flattens nested objects in caseStudies and examples arrays into searchable text fields.
 * This allows MongoDB text indexes to properly index the content.
 * 
 * Creates new fields:
 * - `caseStudiesText`: Concatenated text from all case studies
 * - `examplesText`: Concatenated text from all examples
 * 
 * These fields are added to the text index for full searchability.
 * 
 * Usage:
 *   tsx scripts/admin/extract-case-studies-examples-text.ts
 *   tsx scripts/admin/extract-case-studies-examples-text.ts --dry-run  # Preview changes
 */

import { getDb } from '@/lib/mongodb';

interface CaseStudy {
  title?: string;
  scenario?: string;
  context?: string;
  description?: string;
  input?: string;
  output?: string;
  result?: string;
  outcome?: string;
  [key: string]: unknown;
}

interface Example {
  title?: string;
  input?: string;
  output?: string;
  description?: string;
  scenario?: string;
  context?: string;
  [key: string]: unknown;
}

/**
 * Extract all text content from a case study object
 */
function extractCaseStudyText(caseStudy: CaseStudy): string {
  const parts: string[] = [];
  
  if (caseStudy.title) parts.push(caseStudy.title);
  if (caseStudy.scenario) parts.push(caseStudy.scenario);
  if (caseStudy.context) parts.push(caseStudy.context);
  if (caseStudy.description) parts.push(caseStudy.description);
  if (caseStudy.input) parts.push(`Input: ${caseStudy.input}`);
  if (caseStudy.output) parts.push(`Output: ${caseStudy.output}`);
  if (caseStudy.result) parts.push(`Result: ${caseStudy.result}`);
  if (caseStudy.outcome) parts.push(`Outcome: ${caseStudy.outcome}`);
  
  // Extract any other string values
  Object.keys(caseStudy).forEach(key => {
    if (key !== 'title' && key !== 'scenario' && key !== 'context' && 
        key !== 'description' && key !== 'input' && key !== 'output' && 
        key !== 'result' && key !== 'outcome') {
      const value = caseStudy[key];
      if (typeof value === 'string' && value.trim()) {
        parts.push(value);
      }
    }
  });
  
  return parts.join(' ').trim();
}

/**
 * Extract all text content from an example object
 */
function extractExampleText(example: Example): string {
  const parts: string[] = [];
  
  if (example.title) parts.push(example.title);
  if (example.description) parts.push(example.description);
  if (example.scenario) parts.push(example.scenario);
  if (example.context) parts.push(example.context);
  if (example.input) parts.push(`Input: ${example.input}`);
  if (example.output) parts.push(`Output: ${example.output}`);
  
  // Extract any other string values
  Object.keys(example).forEach(key => {
    if (key !== 'title' && key !== 'description' && key !== 'scenario' && 
        key !== 'context' && key !== 'input' && key !== 'output') {
      const value = example[key];
      if (typeof value === 'string' && value.trim()) {
        parts.push(value);
      }
    }
  });
  
  return parts.join(' ').trim();
}

async function extractTextSnippets(dryRun: boolean = false) {
  console.log('🔍 Extracting text from case studies and examples...\n');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (will update database)'}\n`);

  try {
    const db = await getDb();
    const promptsCollection = db.collection('prompts');
    
    // Find prompts with caseStudies or examples
    const prompts = await promptsCollection.find({
      $or: [
        { caseStudies: { $exists: true, $ne: null, $not: { $size: 0 } } },
        { examples: { $exists: true, $ne: null, $not: { $size: 0 } } }
      ]
    }).toArray();

    console.log(`Found ${prompts.length} prompts with case studies or examples\n`);

    let updated = 0;
    let skipped = 0;
    
    for (const prompt of prompts) {
      const updates: { caseStudiesText?: string; examplesText?: string } = {};
      let hasUpdates = false;
      
      // Extract text from case studies
      if (prompt.caseStudies && Array.isArray(prompt.caseStudies) && prompt.caseStudies.length > 0) {
        const caseStudyTexts = prompt.caseStudies
          .map((cs: unknown) => {
            if (typeof cs === 'object' && cs !== null) {
              return extractCaseStudyText(cs as CaseStudy);
            }
            return '';
          })
          .filter((text: string) => text.length > 0);
        
        if (caseStudyTexts.length > 0) {
          const combinedText = caseStudyTexts.join(' | ');
          updates.caseStudiesText = combinedText;
          hasUpdates = true;
        }
      }
      
      // Extract text from examples
      if (prompt.examples && Array.isArray(prompt.examples) && prompt.examples.length > 0) {
        const exampleTexts = prompt.examples
          .map((ex: unknown) => {
            if (typeof ex === 'object' && ex !== null) {
              return extractExampleText(ex as Example);
            }
            if (typeof ex === 'string') {
              return ex; // Already a string
            }
            return '';
          })
          .filter((text: string) => text.length > 0);
        
        if (exampleTexts.length > 0) {
          const combinedText = exampleTexts.join(' | ');
          updates.examplesText = combinedText;
          hasUpdates = true;
        }
      }
      
      if (hasUpdates) {
        if (dryRun) {
          console.log(`Would update: ${prompt.title || prompt.id || 'Untitled'}`);
          if (updates.caseStudiesText) {
            console.log(`  Case Studies Text (${updates.caseStudiesText.length} chars): ${updates.caseStudiesText.substring(0, 100)}...`);
          }
          if (updates.examplesText) {
            console.log(`  Examples Text (${updates.examplesText.length} chars): ${updates.examplesText.substring(0, 100)}...`);
          }
          console.log('');
        } else {
          await promptsCollection.updateOne(
            { _id: prompt._id },
            { 
              $set: {
                ...updates,
                updatedAt: new Date()
              }
            }
          );
          updated++;
        }
      } else {
        skipped++;
      }
    }
    
    if (dryRun) {
      console.log(`\n📊 Summary:`);
      console.log(`  Would update: ${updated} prompts`);
      console.log(`  Would skip: ${skipped} prompts`);
      console.log(`\n💡 Run without --dry-run to apply changes`);
    } else {
      console.log(`\n✅ Completed:`);
      console.log(`  Updated: ${updated} prompts`);
      console.log(`  Skipped: ${skipped} prompts`);
      console.log(`\n💡 Next step: Run ensure-text-indexes.ts to add these fields to the text index`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error extracting text snippets:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('--dryrun');

extractTextSnippets(dryRun);

