#!/usr/bin/env tsx
/**
 * Fix guardrails with empty mitigation strings
 */

import * as fs from 'fs';
import * as path from 'path';

const WORKFLOWS_FILE = path.join(process.cwd(), 'public/data/workflows.json');
const BACKUP_FILE = path.join(process.cwd(), 'public/data/workflows-backup.json');

interface WorkflowData {
  workflows: Array<{
    category?: string;
    mitigation?: string[];
    slug?: string;
    [key: string]: unknown;
  }>;
  totalWorkflows?: number;
  [key: string]: unknown;
}

async function main() {
  const data = JSON.parse(fs.readFileSync(WORKFLOWS_FILE, 'utf-8')) as WorkflowData;
  
  let fixed = 0;
  const workflows = data.workflows.map((workflow) => {
    // Only check guardrails
    if (workflow.category !== 'guardrails') {
      return workflow;
    }
    
    // Check mitigation array
    if (workflow.mitigation && Array.isArray(workflow.mitigation)) {
      // Filter out empty strings
      const validMitigation = workflow.mitigation.filter((step: string) => step && step.trim() !== '');
      const hasEmpty = workflow.mitigation.some((step: string) => !step || step.trim() === '');
      const hasWrongLength = validMitigation.length !== 3;
      
      if (hasEmpty || hasWrongLength) {
        if (validMitigation.length === 3) {
          // If we have exactly 3 valid steps, use them (remove empty strings)
          workflow.mitigation = validMitigation;
          fixed++;
        } else {
          // If we don't have exactly 3 valid steps, remove the mitigation field (it's optional)
          delete workflow.mitigation;
          fixed++;
        }
      }
    }
    
    return workflow;
  });
  
  if (fixed > 0) {
    console.log(`Fixed ${fixed} guardrails with empty mitigation strings`);
    
    // Update the workflows array and total count
    data.workflows = workflows;
    data.totalWorkflows = workflows.length;
    
    // Create backup
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
    console.log(`✅ Updated ${BACKUP_FILE}`);
    
    // Update main file
    fs.writeFileSync(WORKFLOWS_FILE, JSON.stringify(data, null, 2));
    console.log(`✅ Updated ${WORKFLOWS_FILE}`);
  } else {
    console.log('No guardrails with empty mitigation strings found');
  }
  
  // Verify
  const guardrails = workflows.filter((w) => w.category === 'guardrails');
  console.log(`\nTotal guardrails: ${guardrails.length}`);
  
  const invalidMitigation = guardrails.filter((g) => {
    if (!g.mitigation) return false;
    return g.mitigation.some((step: string) => !step || step.trim() === '');
  });
  
  if (invalidMitigation.length > 0) {
    console.log(`⚠️ Still ${invalidMitigation.length} guardrails with invalid mitigation`);
    invalidMitigation.slice(0, 3).forEach((g) => {
      console.log(`  - ${g.slug}: ${g.mitigation?.length ?? 0} steps`);
    });
  } else {
    console.log('✅ All guardrails have valid mitigation or no mitigation field');
  }
}

main().catch(console.error);

