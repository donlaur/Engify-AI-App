#!/usr/bin/env tsx
/**
 * Merge Guardrails into Workflows JSON
 * 
 * Combines guardrails.json with workflows.json into a single workflows.json file
 */

import * as fs from 'fs';
import * as path from 'path';

const WORKFLOWS_FILE = path.join(process.cwd(), 'public/data/workflows.json');
const GUARDRAILS_FILE = path.join(process.cwd(), 'public/data/guardrails.json');
const BACKUP_FILE = path.join(process.cwd(), 'public/data/workflows-backup.json');

async function main() {
  // Read existing workflows
  const workflowsData = JSON.parse(fs.readFileSync(WORKFLOWS_FILE, 'utf-8'));
  
  // Read guardrails
  const guardrailsData = JSON.parse(fs.readFileSync(GUARDRAILS_FILE, 'utf-8'));
  
  // Create backup
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(workflowsData, null, 2));
  console.log(`✅ Created backup: ${BACKUP_FILE}`);
  
  // Merge guardrails into workflows
  const merged = {
    ...workflowsData,
    totalWorkflows: workflowsData.totalWorkflows + guardrailsData.totalGuardrails,
    workflows: [
      ...workflowsData.workflows,
      ...guardrailsData.guardrails,
    ],
    generatedAt: new Date().toISOString(),
  };
  
  // Write merged file
  fs.writeFileSync(WORKFLOWS_FILE, JSON.stringify(merged, null, 2));
  
  console.log(`✅ Merged ${guardrailsData.totalGuardrails} guardrails into workflows.json`);
  console.log(`   Total workflows: ${merged.totalWorkflows}`);
  console.log(`   Regular workflows: ${workflowsData.totalWorkflows}`);
  console.log(`   Guardrails: ${guardrailsData.totalGuardrails}`);
}

main().catch(console.error);

