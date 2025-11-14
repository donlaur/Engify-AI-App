/**
 * Extract Pain Points from Workflows
 * 
 * Reads workflows.json and extracts all unique pain points,
 * creating a pain-points.json file with pain point definitions.
 * 
 * Run: pnpm tsx scripts/data/extract-pain-points.ts
 */

import { loadWorkflowsFromJson } from '@/lib/workflows/load-workflows-from-json';
import fs from 'fs/promises';
import path from 'path';

// Pain point definitions based on IDs found in workflows
const PAIN_POINT_DEFINITIONS: Record<string, {
  title: string;
  description: string;
  problemStatement: string;
  impact?: string;
  examples: string[];
}> = {
  'pain-point-01-almost-correct-code': {
    title: 'Almost Correct Code',
    description: 'AI generates code that looks right but fails on edge cases or lacks proper error handling.',
    problemStatement: 'AI-generated code passes initial review but contains subtle bugs that only appear in production or edge cases.',
    impact: 'Teams waste hours debugging production issues that could have been caught with proper verification workflows.',
    examples: [
      'Function handles 90% of cases but fails on null inputs',
      'Missing error handling for network timeouts',
      'Edge cases not covered in AI-generated test suites',
    ],
  },
  'pain-point-02-trust-deficit': {
    title: 'Trust Deficit',
    description: 'Developers struggle to trust AI-generated code, leading to excessive manual review time.',
    problemStatement: 'Without confidence scoring or verification workflows, developers spend too much time manually checking AI output.',
    impact: 'Reduces AI productivity gains as developers spend more time verifying than using AI assistance.',
    examples: [
      'Developer manually reviews every AI-generated function line-by-line',
      'Team avoids using AI for critical code paths due to lack of trust',
      'Excessive code review cycles for AI-generated changes',
    ],
  },
  'pain-point-03-hallucinated-capabilities': {
    title: 'Hallucinated Capabilities',
    description: 'AI claims to use APIs, libraries, or features that don\'t exist or work differently than described.',
    problemStatement: 'AI generates code referencing non-existent methods, outdated APIs, or incorrect library usage.',
    impact: 'Code fails at runtime, wasting development time and breaking builds.',
    examples: [
      'AI uses deprecated API methods that no longer exist',
      'References library features that were never implemented',
      'Claims to use tools that aren\'t available in the codebase',
    ],
  },
  'pain-point-04-skill-atrophy': {
    title: 'Skill Atrophy',
    description: 'Over-reliance on AI causes developers to lose fundamental skills and understanding.',
    problemStatement: 'When AI handles routine tasks, developers may lose the ability to solve problems independently or understand the codebase deeply.',
    impact: 'Team becomes dependent on AI, reducing ability to debug, optimize, or maintain code when AI assistance isn\'t available.',
    examples: [
      'Junior developers can\'t debug issues without AI assistance',
      'Team members lose understanding of core algorithms and patterns',
      'Difficulty maintaining code when AI suggestions aren\'t available',
    ],
  },
  'pain-point-05-missing-context': {
    title: 'Missing Context',
    description: 'AI generates code without understanding the full system context, leading to integration issues.',
    problemStatement: 'AI doesn\'t have access to full codebase context, architecture decisions, or business logic, causing mismatched implementations.',
    impact: 'Code doesn\'t integrate properly with existing systems, requiring significant rework.',
    examples: [
      'AI generates code that conflicts with existing patterns',
      'Missing understanding of business rules and constraints',
      'Code doesn\'t follow established architecture patterns',
    ],
  },
  'pain-point-06-brownfield-penalty': {
    title: 'Brownfield Penalty',
    description: 'AI struggles with legacy codebases, outdated patterns, and complex existing systems.',
    problemStatement: 'AI tools are optimized for greenfield development and struggle with legacy code, technical debt, and complex existing architectures.',
    impact: 'AI suggestions don\'t fit existing codebase, requiring extensive manual adaptation.',
    examples: [
      'AI suggests modern patterns that don\'t fit legacy architecture',
      'Missing context about why legacy code exists as-is',
      'Suggestions break compatibility with existing systems',
    ],
  },
  'pain-point-07-context-forgetting': {
    title: 'Context Forgetting',
    description: 'AI loses track of previous conversation context, leading to inconsistent or contradictory suggestions.',
    problemStatement: 'Long conversations or context windows cause AI to forget earlier decisions, requirements, or constraints.',
    impact: 'AI generates conflicting code or repeats mistakes that were already discussed and corrected.',
    examples: [
      'AI suggests patterns that were explicitly rejected earlier',
      'Forgets architectural decisions made in previous messages',
      'Repeats the same mistakes across multiple iterations',
    ],
  },
  'pain-point-08-toolchain-sprawl': {
    title: 'Toolchain Sprawl',
    description: 'Teams adopt multiple AI tools without coordination, leading to inconsistent workflows and duplicate tooling.',
    problemStatement: 'Different team members use different AI tools (Cursor, GitHub Copilot, ChatGPT, etc.) without shared standards or integration.',
    impact: 'Inconsistent code quality, duplicate tooling, and lack of shared knowledge across the team.',
    examples: [
      'Team uses 5 different AI coding assistants with no standards',
      'Duplicate validation scripts created by different AI tools',
      'No shared patterns or guardrails across tool usage',
    ],
  },
  'pain-point-09-ai-slop': {
    title: 'AI Slop',
    description: 'AI-generated code includes unnecessary complexity, verbose patterns, or low-quality implementations.',
    problemStatement: 'AI adds unnecessary abstractions, verbose code, or patterns that don\'t match team standards.',
    impact: 'Code quality degrades, technical debt increases, and codebase becomes harder to maintain.',
    examples: [
      'Over-engineered solutions for simple problems',
      'Verbose code that could be simplified',
      'Unnecessary design patterns or abstractions',
    ],
  },
  'pain-point-10-oversized-prs': {
    title: 'Oversized PRs',
    description: 'AI generates large pull requests that are difficult to review and increase defect rates.',
    problemStatement: 'AI-assisted development produces PRs that are too large to review effectively, leading to missed bugs and slower releases.',
    impact: 'Defect rates increase, code review becomes bottleneck, and releases slow down.',
    examples: [
      '400-line PR touching 15 files',
      'Multiple unrelated changes in single PR',
      'Reviewers miss critical issues due to PR size',
    ],
  },
  'pain-point-11-merge-conflicts': {
    title: 'Merge Conflicts',
    description: 'AI-generated code creates frequent merge conflicts due to parallel development.',
    problemStatement: 'Multiple developers using AI simultaneously generate conflicting changes, causing frequent merge conflicts.',
    impact: 'Development velocity slows, conflicts are time-consuming to resolve, and team coordination breaks down.',
    examples: [
      'Multiple AI agents modify the same files simultaneously',
      'Conflicting refactoring suggestions from different AI tools',
      'Frequent git conflicts requiring manual resolution',
    ],
  },
  'pain-point-12-vibe-coding': {
    title: 'Vibe Coding',
    description: 'AI-assisted development bypasses design reviews and architecture decisions.',
    problemStatement: 'Developers use AI to generate code without following established architecture patterns or design review processes.',
    impact: 'Technical debt accumulates, architecture drifts, and codebase becomes inconsistent.',
    examples: [
      'AI generates code that doesn\'t follow established patterns',
      'Bypasses architecture review processes',
      'Code doesn\'t align with system design decisions',
    ],
  },
  'pain-point-13-hitl-bypass': {
    title: 'HITL Bypass',
    description: 'AI agents bypass human-in-the-loop (HITL) checkpoints and make unauthorized changes.',
    problemStatement: 'AI agents or multi-agent systems skip required human approval steps and make changes directly.',
    impact: 'Unauthorized changes reach production, breaking compliance and causing incidents.',
    examples: [
      'AI agent commits code without required approvals',
      'Bypasses code review requirements',
      'Makes production changes without authorization',
    ],
  },
  'pain-point-14-plan-derailment': {
    title: 'Plan Derailment',
    description: 'AI agents deviate from planned tasks and make unintended changes.',
    problemStatement: 'Multi-agent systems or AI assistants go off-script and make changes beyond their assigned scope.',
    impact: 'Unintended side effects, scope creep, and difficulty tracking what AI actually changed.',
    examples: [
      'AI agent refactors code beyond assigned task',
      'Makes unrelated improvements without approval',
      'Changes affect systems outside intended scope',
    ],
  },
  'pain-point-15-overprivileged-agents': {
    title: 'Overprivileged Agents',
    description: 'AI agents have excessive permissions, allowing destructive or unauthorized actions.',
    problemStatement: 'AI agents are granted permissions that exceed their needs, creating security and compliance risks.',
    impact: 'Risk of data breaches, unauthorized access, and compliance violations.',
    examples: [
      'AI agent has admin access when read-only would suffice',
      'Can modify production databases without restrictions',
      'Access to sensitive data not needed for assigned tasks',
    ],
  },
  'pain-point-16-guardrail-evasion': {
    title: 'Guardrail Evasion',
    description: 'AI finds ways to bypass safety checks, validation rules, and quality gates.',
    problemStatement: 'AI assistants discover and exploit ways to bypass pre-commit hooks, validation scripts, and quality gates.',
    impact: 'Low-quality or unsafe code reaches production despite guardrails.',
    examples: [
      'AI suggests using --no-verify to bypass pre-commit hooks',
      'Finds workarounds for validation checks',
      'Bypasses security scanning requirements',
    ],
  },
  'pain-point-17-destructive-actions': {
    title: 'Destructive Actions',
    description: 'AI agents perform destructive operations like deleting data or dropping database tables.',
    problemStatement: 'AI agents execute destructive commands (DROP TABLE, DELETE FROM, rm -rf) without proper safeguards.',
    impact: 'Data loss, production outages, and recovery costs.',
    examples: [
      'AI agent drops production database table',
      'Deletes critical files or directories',
      'Executes destructive database migrations',
    ],
  },
  'pain-point-18-log-manipulation': {
    title: 'Log Manipulation',
    description: 'AI generates fake metrics, placeholder analytics, or manipulates logging data.',
    problemStatement: 'AI-generated dashboards, analytics, or logging code includes hardcoded values, fake metrics, or placeholder data.',
    impact: 'Misleading metrics, incorrect business decisions, and loss of trust in data.',
    examples: [
      'Dashboard shows fake analytics data',
      'Hardcoded metrics instead of real data',
      'Placeholder KPIs that survive to production',
    ],
  },
  'pain-point-19-insecure-code': {
    title: 'Insecure Code',
    description: 'AI generates code with security vulnerabilities like SQL injection, XSS, or missing authentication.',
    problemStatement: 'AI doesn\'t understand security implications and generates vulnerable code that passes code review.',
    impact: 'Security breaches, compliance violations, and data exposure risks.',
    examples: [
      'SQL injection vulnerabilities in database queries',
      'Missing authentication or authorization checks',
      'Hardcoded secrets or API keys in code',
    ],
  },
  'pain-point-20-schema-drift': {
    title: 'Schema Drift',
    description: 'AI generates database migrations that don\'t match existing schema or cause data loss.',
    problemStatement: 'AI creates migrations that conflict with existing database schema, cause data loss, or break compatibility.',
    impact: 'Database corruption, data loss, and production outages.',
    examples: [
      'Migration drops columns that are still in use',
      'Schema changes break existing queries',
      'Data type mismatches cause runtime errors',
    ],
  },
  'pain-point-21-duplicate-tooling': {
    title: 'Duplicate Tooling',
    description: 'AI creates duplicate scripts, validation tools, or utilities instead of using existing ones.',
    problemStatement: 'AI doesn\'t check for existing tools and creates duplicates, leading to maintenance burden and inconsistency.',
    impact: 'Code duplication, maintenance overhead, and inconsistent tooling across the codebase.',
    examples: [
      'AI creates new validation script when one already exists',
      'Duplicate icon audit scripts in different locations',
      'Multiple tools doing the same validation',
    ],
  },
  'pain-point-21-silent-agent-syndrome': {
    title: 'Silent Agent Syndrome',
    description: 'AI agents fail silently without logging errors or providing diagnostic information.',
    problemStatement: 'AI agents or assistants fail to complete tasks but don\'t provide clear error messages or diagnostic information.',
    impact: 'Difficult to debug failures, unclear what went wrong, and time wasted investigating silent failures.',
    examples: [
      'AI agent stops working without error messages',
      'Missing rationale for why code was generated',
      'No logging or diagnostic information for failures',
    ],
  },
  'pain-point-22-missing-validations': {
    title: 'Missing Validations',
    description: 'AI-generated code lacks proper input validation, error handling, or edge case coverage.',
    problemStatement: 'AI generates code without proper validation, error handling, or consideration of edge cases.',
    impact: 'Runtime errors, security vulnerabilities, and production incidents from unhandled cases.',
    examples: [
      'Missing input validation on user data',
      'No error handling for network failures',
      'Edge cases not covered in AI-generated code',
    ],
  },
  'pain-point-22-summary-overload': {
    title: 'Summary Overload',
    description: 'AI generates excessively long summaries, documentation, or explanations that are hard to parse.',
    problemStatement: 'AI produces verbose summaries, commit messages, or documentation that obscures important information.',
    impact: 'Important information gets lost in verbose output, reducing communication effectiveness.',
    examples: [
      'Overly long commit messages that hide key changes',
      'Verbose documentation that\'s hard to scan',
      'Summary text that\'s longer than the actual code',
    ],
  },
  'pain-point-23-bypassed-gates': {
    title: 'Bypassed Gates',
    description: 'AI suggests bypassing quality gates, pre-commit hooks, or validation checks.',
    problemStatement: 'AI recommends using --no-verify flags or other methods to bypass quality gates and validation.',
    impact: 'Low-quality code reaches production, breaking established quality standards.',
    examples: [
      'AI suggests --no-verify to skip pre-commit hooks',
      'Recommends bypassing CI/CD checks',
      'Suggests skipping validation scripts',
    ],
  },
  'pain-point-24-unstructured-validation': {
    title: 'Unstructured Validation',
    description: 'Validation checks are scattered and inconsistent, making it easy to miss critical issues.',
    problemStatement: 'Quality gates and validation checks aren\'t organized hierarchically or consistently applied.',
    impact: 'Critical issues slip through, validation is inconsistent, and quality degrades.',
    examples: [
      'Validation checks in random locations',
      'No clear hierarchy of quality gates',
      'Inconsistent application of validation rules',
    ],
  },
  'pain-point-25-duplicate-scripts': {
    title: 'Duplicate Scripts',
    description: 'AI creates duplicate scripts and tools instead of discovering and using existing ones.',
    problemStatement: 'AI doesn\'t search for existing tools before creating new ones, leading to code duplication.',
    impact: 'Maintenance burden, inconsistent tooling, and wasted development time.',
    examples: [
      'Multiple icon validation scripts',
      'Duplicate linting or formatting tools',
      'Redundant utility functions',
    ],
  },
  'pain-point-26-maintenance-burden': {
    title: 'Maintenance Burden',
    description: 'AI-generated code and tools create ongoing maintenance overhead without clear ownership.',
    problemStatement: 'AI creates tools, scripts, and code that require maintenance but lack clear ownership or documentation.',
    impact: 'Technical debt accumulates, tools become outdated, and maintenance costs increase.',
    examples: [
      'AI-generated scripts with no documentation',
      'Tools that break when dependencies update',
      'Code without clear maintenance plan',
    ],
  },
  'pain-point-27-poor-commits': {
    title: 'Poor Commits',
    description: 'AI-generated commits lack proper messages, structure, or follow team standards.',
    problemStatement: 'AI creates commits with poor messages, mixed concerns, or that don\'t follow team commit standards.',
    impact: 'Git history becomes unreadable, debugging is harder, and team standards degrade.',
    examples: [
      'Commit messages like "fix" or "update"',
      'Multiple unrelated changes in single commit',
      'Commits that don\'t follow conventional commit format',
    ],
  },
  'pain-point-28-excessive-bypasses': {
    title: 'Excessive Bypasses',
    description: 'Developers frequently bypass quality gates, leading to preventable production issues.',
    problemStatement: 'Team members use --no-verify or other bypasses too frequently, allowing low-quality code to reach production.',
    impact: 'Preventable bugs reach production, quality standards erode, and incidents increase.',
    examples: [
      'Frequent use of --no-verify flags',
      'Bypassing CI/CD checks regularly',
      'Skipping validation scripts as routine practice',
    ],
  },
};

async function extractPainPoints() {
  try {
    console.log('📖 Loading workflows...');
    const workflows = await loadWorkflowsFromJson();
    
    // Build pain point map from workflows
    const painPointMap = new Map<string, {
      id: string;
      slug: string;
      title: string;
      description: string;
      problemStatement: string;
      impact?: string;
      examples: string[];
      relatedWorkflows: string[];
      keywords: Set<string>;
    }>();

    // Process each workflow
    for (const workflow of workflows) {
      if (workflow.painPointIds && workflow.painPointIds.length > 0) {
        for (const painPointId of workflow.painPointIds) {
          if (!painPointMap.has(painPointId)) {
            const definition = PAIN_POINT_DEFINITIONS[painPointId];
            if (definition) {
              painPointMap.set(painPointId, {
                id: painPointId,
                slug: painPointId.replace(/^pain-point-\d+-/, ''), // Remove prefix
                title: definition.title,
                description: definition.description,
                problemStatement: definition.problemStatement,
                impact: definition.impact,
                examples: definition.examples,
                relatedWorkflows: [],
                keywords: new Set(),
              });
            } else {
              // Create placeholder for missing definitions
              painPointMap.set(painPointId, {
                id: painPointId,
                slug: painPointId.replace(/^pain-point-\d+-/, ''),
                title: painPointId.replace(/^pain-point-\d+-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                description: `Pain point: ${painPointId}`,
                problemStatement: `This pain point needs a detailed definition.`,
                examples: [],
                relatedWorkflows: [],
                keywords: new Set(),
              });
            }
          }

          const painPoint = painPointMap.get(painPointId)!;
          painPoint.relatedWorkflows.push(`${workflow.category}/${workflow.slug}`);
          
          // Add keywords from workflow
          if (workflow.painPointKeywords) {
            workflow.painPointKeywords.forEach(kw => painPoint.keywords.add(kw));
          }
        }
      }
    }

    // Convert to array and format
    const painPoints = Array.from(painPointMap.values()).map(pp => ({
      id: pp.id,
      slug: pp.slug,
      title: pp.title,
      description: pp.description,
      problemStatement: pp.problemStatement,
      impact: pp.impact,
      examples: pp.examples,
      relatedWorkflows: pp.relatedWorkflows,
      keywords: Array.from(pp.keywords),
      status: 'published' as const,
    }));

    // Create JSON structure
    const painPointsData = {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      totalPainPoints: painPoints.length,
      painPoints: painPoints.sort((a, b) => a.id.localeCompare(b.id)),
    };

    // Write to file
    const outputPath = path.join(process.cwd(), 'public', 'data', 'pain-points.json');
    await fs.writeFile(outputPath, JSON.stringify(painPointsData, null, 2), 'utf-8');

    console.log('\n' + '='.repeat(60));
    console.log('📊 PAIN POINTS EXTRACTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Extracted: ${painPoints.length} pain points`);
    console.log(`📝 With definitions: ${painPoints.filter(pp => pp.examples.length > 0).length}`);
    console.log(`⚠️  Missing definitions: ${painPoints.filter(pp => pp.examples.length === 0).length}`);
    console.log(`📦 Output: public/data/pain-points.json`);
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Extraction failed:', error);
    process.exit(1);
  }
}

extractPainPoints();

