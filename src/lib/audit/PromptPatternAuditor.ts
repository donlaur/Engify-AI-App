/**
 * Prompt Pattern Auditor
 * 
 * Multi-agent audit system for prompts and patterns.
 * Extracted from scripts to be usable in API routes.
 */

import { AIProviderFactoryWithRegistry } from '@/lib/ai/v2/factory/AIProviderFactoryWithRegistry';

// Re-export types and interfaces
export interface AuditResult {
  id: string;
  type: 'prompt' | 'pattern';
  title: string;
  overallScore: number;
  categoryScores: {
    engineeringUsefulness: number;
    caseStudyQuality: number;
    completeness: number;
    seoEnrichment: number;
    enterpriseReadiness: number;
    securityCompliance: number;
    accessibility: number;
    performance: number;
  };
  issues: string[];
  recommendations: string[];
  missingElements: string[];
  needsFix: boolean;
  agentReviews: Record<string, string>;
}

export interface AuditAgent {
  role: string;
  name: string;
  model: string;
  provider: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

// Import AUDIT_AGENTS from the script file (we'll need to export it)
// For now, define a minimal version here or import from the script
// Since we can't import from scripts in Next.js, we'll need to copy the agents array

// Import audit agents - we'll need to copy them here or create a shared file
// For now, let's create a wrapper that imports dynamically only when needed
// Actually, better approach: create a separate file for audit agents config

// This is a stub - the full implementation will be in the next file
export class PromptPatternAuditor {
  private organizationId: string;

  constructor(organizationId: string = 'system') {
    this.organizationId = organizationId;
  }

  async auditPrompt(prompt: any): Promise<AuditResult> {
    // This will be implemented in the full file
    throw new Error('Not implemented - use the full auditor from scripts/content/audit-prompts-patterns');
  }
}


