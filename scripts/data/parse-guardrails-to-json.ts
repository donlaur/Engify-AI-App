#!/usr/bin/env tsx
/**
 * Parse Guardrails from Markdown to JSON
 * 
 * Converts processed guardrail markdown files into workflow JSON format
 */

import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

const GUARDRAIL_DIR = path.join(process.cwd(), 'docs/research/guardrails');
const OUTPUT_FILE = path.join(process.cwd(), 'public/data/guardrails.json');

interface GuardrailMarkdown {
  slug: string;
  title: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  problem: string;
  preventionChecklist: string[];
  earlyDetection: {
    cicd?: string;
    static?: string;
    runtime?: string;
  };
  mitigation: [string, string, string];
  eEatSignals: {
    experience?: string;
    expertise?: string;
    authoritativeness?: string;
    trustworthiness?: string;
  };
  workflows: string[];
  painPoints: string[];
}

function parseMarkdownFile(filePath: string): GuardrailMarkdown[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const guardrails: GuardrailMarkdown[] = [];
  
  // Split by guardrail sections (## Number. Title)
  const sections = content.split(/^## \d+\. /m).filter(s => s.trim());
  
  for (const section of sections) {
    try {
      const guardrail = parseGuardrailSection(section);
      if (guardrail) {
        guardrails.push(guardrail);
      }
    } catch (error) {
      console.error(`Error parsing section in ${filePath}:`, error);
    }
  }
  
  return guardrails;
}

function parseGuardrailSection(section: string): GuardrailMarkdown | null {
  // Extract slug
  const slugMatch = section.match(/\*\*Slug:\*\* `([^`]+)`/);
  const slug = slugMatch?.[1] || '';
  if (!slug) return null;
  
  // Extract title (first line after ## Number. - remove markdown bold)
  const titleMatch = section.match(/^## \d+\. (.+)$/m);
  const title = titleMatch?.[1]?.trim() || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Extract category and severity
  const categoryMatch = section.match(/\*\*Category:\*\* ([^|]+) \| \*\*Severity:\*\* (\w+)/);
  const category = categoryMatch?.[1]?.trim() || '';
  const severityRaw = categoryMatch?.[2]?.trim() || 'medium';
  const severity: 'critical' | 'high' | 'medium' | 'low' = 
    (severityRaw === 'critical' || severityRaw === 'high' || severityRaw === 'low') 
      ? severityRaw 
      : 'medium';
  
  // Extract problem
  const problemMatch = section.match(/\*\*Problem:\*\* (.+?)(?=\n\*\*Prevention|\n---|$)/s);
  const problem = problemMatch?.[1]?.trim() || '';
  
  // Extract prevention checklist
  const checklistItems: string[] = [];
  const checklistStart = section.indexOf('**Prevention Checklist:**');
  if (checklistStart !== -1) {
    const checklistSection = section.substring(checklistStart);
    const checklistEnd = checklistSection.indexOf('\n**Early Detection:**');
    const checklistContent = checklistEnd !== -1 
      ? checklistSection.substring(0, checklistEnd)
      : checklistSection;
    
    const itemMatches = checklistContent.matchAll(/^- \[ \] (.+)$/gm);
    for (const match of itemMatches) {
      checklistItems.push(match[1].trim());
    }
  }
  
  // Extract early detection
  const earlyDetection: { cicd?: string; static?: string; runtime?: string } = {};
  const detectionStart = section.indexOf('**Early Detection:**');
  if (detectionStart !== -1) {
    const detectionSection = section.substring(detectionStart);
    const detectionEnd = detectionSection.indexOf('\n**Mitigation:**');
    const detectionContent = detectionEnd !== -1
      ? detectionSection.substring(0, detectionEnd)
      : detectionSection;
    
    const cicdMatch = detectionContent.match(/- \*\*CI\/CD:\*\* (.+?)(?=\n- \*\*|$)/s);
    const staticMatch = detectionContent.match(/- \*\*Static:\*\* (.+?)(?=\n- \*\*|$)/s);
    const runtimeMatch = detectionContent.match(/- \*\*Runtime:\*\* (.+?)(?=\n- \*\*|$)/s);
    
    if (cicdMatch) earlyDetection.cicd = cicdMatch[1].trim();
    if (staticMatch) earlyDetection.static = staticMatch[1].trim();
    if (runtimeMatch) earlyDetection.runtime = runtimeMatch[1].trim();
  }
  
  // Extract mitigation (3 steps)
  const mitigation: [string, string, string] = ['', '', ''];
  const mitigationStart = section.indexOf('**Mitigation:**');
  if (mitigationStart !== -1) {
    const mitigationSection = section.substring(mitigationStart);
    const mitigationEnd = mitigationSection.indexOf('\n**E-E-A-T');
    const mitigationContent = mitigationEnd !== -1
      ? mitigationSection.substring(0, mitigationEnd)
      : mitigationSection;
    
    const stepMatches = mitigationContent.matchAll(/^\d+\. (.+?)(?=\n\d+\. |$)/gms);
    let index = 0;
    for (const match of stepMatches) {
      if (index < 3) {
        mitigation[index] = match[1].trim().replace(/\n/g, ' ');
        index++;
      }
    }
  }
  
  // Extract E-E-A-T signals
  const eEatSignals: {
    experience?: string;
    expertise?: string;
    authoritativeness?: string;
    trustworthiness?: string;
  } = {};
  const eEatStart = section.indexOf('**E-E-A-T Signals (SEO):**');
  if (eEatStart === -1) {
    // Try without (SEO)
    const eEatStartAlt = section.indexOf('**E-E-A-T Signals:**');
    if (eEatStartAlt !== -1) {
      const eEatSection = section.substring(eEatStartAlt);
      const eEatEnd = eEatSection.indexOf('\n**Workflows:**');
      const eEatContent = eEatEnd !== -1
        ? eEatSection.substring(0, eEatEnd)
        : eEatSection;
      
      const experienceMatch = eEatContent.match(/- \*\*Experience:\*\* (.+?)(?=\n- \*\*|$)/s);
      const expertiseMatch = eEatContent.match(/- \*\*Expertise:\*\* (.+?)(?=\n- \*\*|$)/s);
      const authoritativenessMatch = eEatContent.match(/- \*\*Authoritativeness:\*\* (.+?)(?=\n- \*\*|$)/s);
      const trustworthinessMatch = eEatContent.match(/- \*\*Trustworthiness:\*\* (.+?)(?=\n- \*\*|$)/s);
      
      if (experienceMatch) eEatSignals.experience = experienceMatch[1].trim();
      if (expertiseMatch) eEatSignals.expertise = expertiseMatch[1].trim();
      if (authoritativenessMatch) eEatSignals.authoritativeness = authoritativenessMatch[1].trim();
      if (trustworthinessMatch) eEatSignals.trustworthiness = trustworthinessMatch[1].trim();
    }
  } else {
    const eEatSection = section.substring(eEatStart);
    const eEatEnd = eEatSection.indexOf('\n**Workflows:**');
    const eEatContent = eEatEnd !== -1
      ? eEatSection.substring(0, eEatEnd)
      : eEatSection;
    
    const experienceMatch = eEatContent.match(/- \*\*Experience:\*\* (.+?)(?=\n- \*\*|$)/s);
    const expertiseMatch = eEatContent.match(/- \*\*Expertise:\*\* (.+?)(?=\n- \*\*|$)/s);
    const authoritativenessMatch = eEatContent.match(/- \*\*Authoritativeness:\*\* (.+?)(?=\n- \*\*|$)/s);
    const trustworthinessMatch = eEatContent.match(/- \*\*Trustworthiness:\*\* (.+?)(?=\n- \*\*|$)/s);
    
    if (experienceMatch) eEatSignals.experience = experienceMatch[1].trim();
    if (expertiseMatch) eEatSignals.expertise = expertiseMatch[1].trim();
    if (authoritativenessMatch) eEatSignals.authoritativeness = authoritativenessMatch[1].trim();
    if (trustworthinessMatch) eEatSignals.trustworthiness = trustworthinessMatch[1].trim();
  }
  
  // Extract workflows (format: `category/slug` or `category/slug` (description))
  const workflows: string[] = [];
  const workflowsMatch = section.match(/\*\*Workflows:\*\* (.+?)(?=\n\*\*Pain Points:|\n---|$)/s);
  if (workflowsMatch) {
    const workflowsSection = workflowsMatch[1];
    const workflowMatches = workflowsSection.matchAll(/`([^`]+)`/g);
    for (const match of workflowMatches) {
      const workflowStr = match[1].trim();
      // Extract just the slug part (before space or parenthesis)
      const slugPart = workflowStr.split(/[ (]/)[0];
      workflows.push(slugPart);
    }
  }
  
  // Extract pain points (format: `pain-point-XX-xxx`)
  const painPoints: string[] = [];
  const painPointsMatch = section.match(/\*\*Pain Points:\*\* (.+?)(?=\n---|$)/s);
  if (painPointsMatch) {
    const painPointsSection = painPointsMatch[1];
    const ppMatches = painPointsSection.matchAll(/`([^`]+)`/g);
    for (const ppMatch of ppMatches) {
      const ppId = ppMatch[1].trim();
      painPoints.push(ppId);
    }
  }
  
  return {
    slug,
    title,
    category,
    severity,
    problem,
    preventionChecklist: checklistItems,
    earlyDetection,
    mitigation,
    eEatSignals,
    workflows,
    painPoints,
  };
}

function convertToWorkflowFormat(guardrail: GuardrailMarkdown, subcategory: string): {
  slug: string;
  title: string;
  category: 'guardrails';
  subcategory: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  audience: string[];
  problemStatement: string;
  manualChecklist: string[];
  earlyDetection?: { cicd?: string; static?: string; runtime?: string };
  mitigation?: [string, string, string];
  relatedResources: { adjacentWorkflows: string[] };
  painPointIds: string[];
  painPointKeywords: string[];
  eEatSignals?: {
    experience?: string;
    expertise?: string;
    authoritativeness?: string;
    trustworthiness?: string;
  };
  status: 'published' | 'draft';
} {
  // Map guardrail subcategory to audience
  const audienceMap: Record<string, string[]> = {
    'data-integrity': ['engineers', 'platform'],
    'security': ['engineers', 'security'],
    'performance': ['engineers', 'platform'],
    'availability': ['engineers', 'platform'],
    'financial': ['engineers', 'product-managers'],
    'integration': ['engineers'],
    'testing': ['engineers', 'qa'],
  };
  
  // Map workflows to adjacentWorkflows format
  const adjacentWorkflows = guardrail.workflows.map(wf => {
    const parts = wf.split(' ');
    return parts[0]; // Just the slug part before the space
  });
  
  return {
    slug: guardrail.slug,
    title: guardrail.title,
    category: 'guardrails',
    subcategory,
    severity: guardrail.severity,
    audience: audienceMap[subcategory] || ['engineers'],
    problemStatement: guardrail.problem,
    manualChecklist: guardrail.preventionChecklist,
    earlyDetection: guardrail.earlyDetection,
    mitigation: guardrail.mitigation,
    relatedResources: {
      adjacentWorkflows,
    },
    painPointIds: guardrail.painPoints,
    painPointKeywords: [], // Can be extracted from pain points later
    eEatSignals: guardrail.eEatSignals,
    status: 'published',
  };
}

async function main() {
  const categoryFiles = [
    'data-integrity.md',
    'security.md',
    'performance.md',
    'availability.md',
    'financial.md',
    'integration.md',
    'testing.md',
  ];
  
  const allGuardrails: Array<{
    slug: string;
    title: string;
    category: 'guardrails';
    subcategory: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    audience: string[];
    problemStatement: string;
    manualChecklist: string[];
    earlyDetection?: { cicd?: string; static?: string; runtime?: string };
    mitigation?: [string, string, string];
    relatedResources: { adjacentWorkflows: string[] };
    painPointIds: string[];
    painPointKeywords: string[];
    eEatSignals?: {
      experience?: string;
      expertise?: string;
      authoritativeness?: string;
      trustworthiness?: string;
    };
    status: 'published' | 'draft';
  }> = [];
  
  for (const file of categoryFiles) {
    const filePath = path.join(GUARDRAIL_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }
    
    const subcategory = file.replace('.md', '');
    const guardrails = parseMarkdownFile(filePath);
    
    console.log(`Parsed ${guardrails.length} guardrails from ${file}`);
    
    for (const guardrail of guardrails) {
      const workflow = convertToWorkflowFormat(guardrail, subcategory);
      allGuardrails.push(workflow);
    }
  }
  
  const output = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    totalGuardrails: allGuardrails.length,
    guardrails: allGuardrails,
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n✅ Generated ${allGuardrails.length} guardrails in ${OUTPUT_FILE}`);
}

main().catch(console.error);

