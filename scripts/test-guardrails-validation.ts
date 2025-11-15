#!/usr/bin/env tsx
/**
 * Test guardrails validation
 */

import * as fs from 'fs';
import * as path from 'path';
import { validateWorkflowsJson } from '../src/lib/workflows/workflow-schema';

const WORKFLOWS_FILE = path.join(process.cwd(), 'public/data/workflows.json');

interface WorkflowData {
  workflows: Array<{
    category?: string;
    subcategory?: string;
    severity?: string;
    mitigation?: string[];
    slug?: string;
    status?: string;
    title?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

async function main() {
  const data = JSON.parse(fs.readFileSync(WORKFLOWS_FILE, 'utf-8')) as WorkflowData;
  
  console.log('Total workflows in JSON:', data.workflows.length);
  
  const guardrails = data.workflows.filter((w) => w.category === 'guardrails');
  console.log('Guardrails in JSON:', guardrails.length);
  
  // Check for issues
  const issues: string[] = [];
  
  guardrails.forEach((g, idx: number) => {
    if (!g.subcategory) issues.push(`Guardrail ${idx + 1} (${g.slug}) missing subcategory`);
    if (!g.severity) issues.push(`Guardrail ${idx + 1} (${g.slug}) missing severity`);
    if (g.mitigation && g.mitigation.length !== 3) {
      issues.push(`Guardrail ${idx + 1} (${g.slug}) mitigation has ${g.mitigation.length} items, expected 3`);
    }
    if (!g.status) issues.push(`Guardrail ${idx + 1} (${g.slug}) missing status`);
  });
  
  if (issues.length > 0) {
    console.log('\n⚠️ Issues found:');
    issues.slice(0, 10).forEach(issue => console.log('  -', issue));
    if (issues.length > 10) console.log(`  ... and ${issues.length - 10} more`);
  } else {
    console.log('\n✅ No obvious issues found');
  }
  
  // Try validation
  try {
    console.log('\n🔍 Attempting validation...');
    const validated = validateWorkflowsJson(data);
    console.log('✅ Validation passed!');
    console.log('Validated workflows:', validated.workflows.length);
    
    const validatedGuardrails = validated.workflows.filter((w) => w.category === 'guardrails');
    console.log('Validated guardrails:', validatedGuardrails.length);
    
    if (validatedGuardrails.length !== guardrails.length) {
      console.log(`⚠️ WARNING: ${guardrails.length - validatedGuardrails.length} guardrails were filtered out during validation!`);
      
      // Find which ones
      const validatedSlugs = new Set(validatedGuardrails.map((g) => g.slug));
      const missing = guardrails.filter((g) => !validatedSlugs.has(g.slug));
      console.log('\nMissing guardrails:');
      missing.slice(0, 5).forEach((g) => console.log(`  - ${g.slug ?? 'unknown'} (${g.title ?? 'unknown'})`));
    }
  } catch (error) {
    const err = error as { message?: string; issues?: Array<{ path: string[]; message: string }> };
    console.error('❌ Validation failed:', err.message ?? 'Unknown error');
    if (err.issues) {
      console.error('\nValidation errors:');
      err.issues.slice(0, 10).forEach((issue) => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      });
    }
  }
}

main().catch(console.error);

