#!/usr/bin/env tsx
/**
 * Audit & Verify Prompts & Patterns with Comprehensive Grading Rubric
 * 
 * Reviews all existing prompts and patterns using multi-agent system
 * with comprehensive grading rubric across 8 categories:
 * - Engineering Usefulness
 * - Case Study Quality
 * - Completeness
 * - SEO Enrichment
 * - Enterprise Readiness
 * - Security & Compliance
 * - Accessibility
 * - Performance
 * 
 * Usage:
 *   tsx scripts/content/audit-prompts-patterns.ts --type=prompts
 *   tsx scripts/content/audit-prompts-patterns.ts --type=prompts --fast  # Skip execution testing (faster)
 *   tsx scripts/content/audit-prompts-patterns.ts --type=prompts --quick # Quick mode: only 2 core agents (fastest)
 *   tsx scripts/content/audit-prompts-patterns.ts --type=prompts --category=code-generation  # Filter by category
 *   tsx scripts/content/audit-prompts-patterns.ts --type=prompts --category=documentation --role=engineer  # Filter by category and role
 *   tsx scripts/content/audit-prompts-patterns.ts --type=prompts --role=product-manager  # Filter by role (PM prompts)
 *   tsx scripts/content/audit-prompts-patterns.ts --type=patterns
 *   tsx scripts/content/audit-prompts-patterns.ts --type=both --limit=10
 * 
 * Categories: code-generation, debugging, documentation, testing, refactoring, architecture, learning, general
 * Roles: engineer, product-manager, engineering-manager, architect, designer, qa, devops-sre, scrum-master, product-owner, c-level
 * 
 * NOTE: This script ONLY does SCORING. It saves audit results to prompt_audit_results collection.
 * To apply improvements, use: pnpm tsx scripts/content/enrich-prompt.ts --id=<prompt-id>
 * Or batch: pnpm tsx scripts/content/batch-audit-enrich.ts
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { AIProviderFactoryWithRegistry } from '@/lib/ai/v2/factory/AIProviderFactoryWithRegistry';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

interface AuditResult {
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

interface AuditAgent {
  role: string;
  name: string;
  model: string;
  provider: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

/**
 * Get a valid model ID from database registry for a provider
 * Falls back to provider name if DB unavailable (will use factory default)
 */
async function getModelIdFromRegistry(provider: string, preferredModel?: string): Promise<string | null> {
  try {
    const { getModelsByProvider } = await import('@/lib/services/AIModelRegistry');
    const models = await getModelsByProvider(provider);
    
    if (models.length === 0) {
      return null; // No models found, will use factory default
    }
    
    // If preferred model specified and exists, use it
    if (preferredModel) {
      const preferred = models.find(m => m.id === preferredModel && ('status' in m ? m.status === 'active' : true));
      if (preferred) return preferred.id;
    }
    
    // Use recommended model, or first active model
    const recommended = models.find(m => ('recommended' in m ? (m as any).recommended : false) && ('status' in m ? m.status === 'active' : true));
    if (recommended) return recommended.id;
    
    // Fallback to first active model
    const firstActive = models.find(m => 'status' in m ? m.status === 'active' : true);
    return firstActive ? firstActive.id : null;
  } catch (error) {
    console.warn(`[Audit] Failed to query DB for ${provider} models:`, error);
    return null; // Will use factory default
  }
}

// Audit Agents - Reduced to 5 essential agents aligned with priorities
// Priority: 1. Completeness, 2. Functionality, 3. SEO, 4. Value, 5. Clarity
// Engineering-focused agents use Claude (better for coding/engineering tasks)
// Other agents use OpenAI (broad capabilities)
const AUDIT_AGENTS: AuditAgent[] = [
  {
    role: 'grading_rubric_expert',
    name: 'Grading Rubric Expert',
    model: 'gpt-4o', // Direct OpenAI - best for comprehensive scoring
    provider: 'openai',
    temperature: 0.2,
    maxTokens: 2500,
    systemPrompt: `You are a Grading Rubric Expert who evaluates prompts and patterns using a comprehensive rubric.

SCORING PRIORITIES (in order of importance):
1. **Completeness** - Has major things for each area (case studies, examples, use cases, best practices, etc.)
2. **Functionality** - Works, solid, gives decent first result (one-shot prompts that produce good output)
3. **SEO** - Good SEO optimization (title, description, keywords, slug)
4. **Value Demonstration** - Shows good value through case studies and examples
5. **Clarity** - Content is clear, human-readable, not too wordy or AI-generated sounding

GRADING RUBRIC:

1. **Completeness (1-10)** - HIGHEST PRIORITY (30% weight)
   - Are all required fields present? (title, description, content, category, slug)
   - Has all major enrichment fields? (case studies, examples, use cases, best practices, recommendedModel, bestTimeToUse)
   - Is enrichment data comprehensive and useful?
   - Are there empty or placeholder fields?
   - Does it cover all major areas (technical, practical, SEO)?
   - Is content complete (not missing sections)?
   - Is data quality acceptable?

2. **Engineering Usefulness (1-10)** - SECOND PRIORITY (25% weight) - Functionality Focus
   - Does this work as a one-shot prompt? (Can copy-paste and get good first result?)
   - Is it practical and actionable for engineers?
   - Does it align with engineering workflows?
   - Is it technically accurate and solid?
   - Can engineers use this immediately without modification?
   - Does it solve real engineering problems effectively?
   - Is it clear and actionable for engineering teams?

3. **SEO Enrichment (1-10)** - THIRD PRIORITY (20% weight)
   - Is title SEO-optimized (50-60 chars, keyword-rich)?
   - Is meta description present and optimized (150-160 chars)?
   - Is slug SEO-friendly (short, descriptive, keyword-rich)?
   - Are keywords/tags relevant and comprehensive?
   - Does content structure support SEO (headings, keywords, etc.)?

4. **Case Study Quality (1-10)** - FOURTH PRIORITY (10% weight) - Value Demonstration
   - Are case studies present and relevant?
   - Do case studies demonstrate real-world value and application?
   - Are case studies diverse (different scenarios)?
   - Are case studies detailed enough?
   - Do case studies show measurable outcomes?
   - Do they clearly show the prompt's value?

5. **Enterprise Readiness (1-10)** - Lower Priority (5% weight)
   - Suitable for enterprise environments?
   - Compliance considerations addressed (SOC 2, GDPR, FedRAMP, etc.)?
   - Enterprise security standards addressed?
   - Scalable and maintainable?
   - Enterprise integration considerations?

6. **Security & Compliance (1-10)** - Lower Priority (5% weight)
   - OWASP Top 10 compliance?
   - Input validation and sanitization?
   - Secure authentication/authorization patterns?
   - Security headers and protections?
   - Threat modeling considered?

7. **Accessibility (1-10)** - Lower Priority (3% weight)
   - WCAG 2.1 Level AA considerations?
   - Screen reader compatibility?
   - Keyboard navigation support?
   - Color contrast requirements?
   - ARIA attributes and semantic HTML?

8. **Performance (1-10)** - Lower Priority (2% weight)
   - Core Web Vitals considerations?
   - Performance optimization opportunities?
   - Caching strategies considered?
   - Query optimization recommendations?
   - Scalability considerations?

SCORING GUIDELINES (LENIENT FOR FIRST VERSIONS):
- Score 8-10: Excellent in this category (meets all criteria, high quality)
- Score 6-7: Good in this category (meets most criteria, minor gaps) - ACCEPTABLE FOR FIRST VERSION
- Score 4-5: Fair in this category (meets some criteria, needs improvement) - ACCEPTABLE FOR FIRST VERSION IF BASIC FUNCTIONALITY WORKS
- Score 1-3: Poor in this category (missing key criteria, significant issues)

FIRST VERSION SCORING GUIDANCE:
- If prompt has basic required fields (title, description, content, category) and works functionally, score at least 5.0
- Missing enrichment fields (case studies, examples, etc.) should only reduce score by 1-2 points, not more
- Focus on "does it work?" over "is it perfect?" for first versions
- A functional prompt that produces good results should score 6.0+ even if enrichment is missing

SPECIAL ATTENTION:
- **Clarity Check**: Does the content sound natural and human-readable? Not overly wordy or AI-generated? Score lower if it feels robotic or verbose. This affects Engineering Usefulness and Completeness scores.
- **One-Shot Functionality**: Can this prompt be used as-is and produce good results? Score higher if yes, lower if it needs significant editing. This is critical for Engineering Usefulness.
- **Value Demonstration**: Do case studies and examples clearly show why someone would use this prompt? Score Case Study Quality higher if yes.

For each category, provide:
- Score (1-10) with justification
- Specific issues found (be concrete and specific)
- ACTIONABLE recommendations with examples, specific fixes, or step-by-step improvements
- Missing elements (what exactly is missing, not just that something is missing)

CRITICAL REQUIREMENTS FOR RECOMMENDATIONS:
- Each recommendation must be ACTIONABLE (can be implemented directly)
- Include specific examples, code snippets, or exact replacements where applicable
- Provide "what to do" not just "what's wrong"
- For issues, include: WHAT (specific problem), WHY (impact), HOW (specific fix), EXAMPLE (before/after if applicable)

CRITICAL: Format your response as VALID JSON (no markdown code blocks, just pure JSON):
{
  "engineeringUsefulness": { "score": 8, "justification": "...", "issues": [...], "recommendations": [...], "missing": [...] },
  "caseStudyQuality": { "score": 6, "justification": "...", "issues": [...], "recommendations": [...], "missing": [...] },
  "completeness": { "score": 7, "justification": "...", "issues": [...], "recommendations": [...], "missing": [...] },
  "seoEnrichment": { "score": 5, "justification": "...", "issues": [...], "recommendations": [...], "missing": [...] },
  "enterpriseReadiness": { "score": 8, "justification": "...", "issues": [...], "recommendations": [...], "missing": [...] },
  "securityCompliance": { "score": 7, "justification": "...", "issues": [...], "recommendations": [...], "missing": [...] },
  "accessibility": { "score": 6, "justification": "...", "issues": [...], "recommendations": [...], "missing": [...] },
  "performance": { "score": 7, "justification": "...", "issues": [...], "recommendations": [...], "missing": [...] }
}`,
  },
  {
    role: 'completeness_reviewer',
    name: 'Completeness Reviewer',
    model: 'gpt-4o', // Direct OpenAI - Priority #1
    provider: 'openai',
    temperature: 0.4,
    maxTokens: 1500,
    systemPrompt: `You are a Completeness Reviewer who checks if prompts/patterns have all required fields and enrichment.

Your focus:
- Check if all required fields are present (title, description, content, category, slug)
- Verify content is complete and not missing sections
- Ensure enrichment data is present (case studies, examples, use cases, best practices, recommendedModel, bestTimeToUse)
- Check for empty or placeholder content
- Validate data quality and comprehensiveness

Review checklist:
1. **Required Fields**: Are all required fields present?
2. **Content Completeness**: Is content complete or missing sections?
3. **Enrichment**: Is enrichment data present and comprehensive?
4. **Empty Fields**: Are there empty or placeholder fields?
5. **Data Quality**: Is the data quality acceptable?

CRITICAL: Provide ACTIONABLE suggestions with specific content to add.

For each missing element, provide:
- What exactly is missing (be specific)
- Why it's important for completeness
- Specific content suggestions or examples to add
- Format/structure for the missing content

Example format:
MISSING: "Case studies section is empty"
WHY: "Case studies demonstrate real-world value and help users understand use cases"
WHAT TO ADD: "Add 2-3 case studies like: [provide specific example case study structure]"
EXAMPLE: "Case Study 1: [Title] - Context: [specific], Challenge: [specific], Solution: [specific], Outcome: [specific]"

Provide:
- Score (1-10) for completeness
- Missing fields or sections with specific examples to add
- Actionable recommendations with content suggestions`,
  },
  {
    role: 'engineering_reviewer',
    name: 'Engineering Functionality Reviewer',
    model: 'claude-3-5-sonnet-20241022', // Claude - excellent for engineering/coding tasks
    provider: 'anthropic',
    temperature: 0.4,
    maxTokens: 1500,
    systemPrompt: `You are an Engineering Functionality Reviewer specializing in evaluating if prompts work as one-shot prompts.

Your focus:
- Does this work as a one-shot prompt? (Can copy-paste and get good first result?)
- Is it practical and actionable for engineers?
- Is it technically accurate and solid?
- Can engineers use this immediately without modification?
- Does it solve real engineering problems effectively?
- Is content clear, human-readable, and not too wordy or AI-generated?

Review checklist:
1. **One-Shot Functionality**: Can this be copy-pasted and produce good results?
2. **Technical Accuracy**: Is the technical content accurate?
3. **Practicality**: Does it solve real engineering problems?
4. **Clarity**: Is it clear, human-readable, not verbose or AI-generated?
5. **Actionability**: Can engineers use this immediately?

CRITICAL: Provide ACTIONABLE suggestions with specific examples.

For each issue found, provide:
- What exactly is wrong (be specific)
- Why it's a problem
- How to fix it (specific steps or code examples)
- Example of improved version if applicable

Example format:
ISSUE: "Prompt lacks context about input format"
WHY: "Engineers won't know what format to provide"
HOW TO FIX: "Add a section 'Input Format' with example: 'Input: [provide your code snippet here]'"
EXAMPLE: "Here's the improved version: [show specific improvement]"

Provide:
- Score (1-10) for engineering functionality
- Specific issues found (especially clarity and one-shot usability)
- Actionable recommendations with concrete examples and fixes`,
  },
  {
    role: 'seo_enrichment_reviewer',
    name: 'SEO Enrichment Reviewer',
    model: 'gpt-4o', // Direct OpenAI - Priority #3
    provider: 'openai',
    temperature: 0.3,
    maxTokens: 1500,
    systemPrompt: `You are an SEO Enrichment Reviewer who checks if prompts/patterns are properly optimized for SEO.

Your focus:
- Check if titles are SEO-optimized (50-60 chars, keyword-rich)
- Verify meta descriptions are present and optimized (150-160 chars)
- Ensure slugs are SEO-friendly (short, descriptive, keyword-rich)
- Check if keywords/tags are relevant and comprehensive
- Verify content structure supports SEO (headings, tags, etc.)

Review checklist:
1. **Title**: Is title SEO-optimized (50-60 chars, keyword-rich)?
2. **Description**: Is meta description present and optimized (150-160 chars)?
3. **Slug**: Is slug SEO-friendly (short, descriptive, keyword-rich)?
4. **Keywords/Tags**: Are keywords/tags relevant and comprehensive?
5. **Structure**: Does content structure support SEO?

CRITICAL: Provide ACTIONABLE SEO improvements with specific replacements.

For each SEO issue, provide:
- Current value and what's wrong with it
- Specific improved version to use
- Why the improvement helps SEO
- Target keywords to include

Example format:
ISSUE: "Slug is 'prompt-1' - not descriptive or keyword-rich"
CURRENT: "prompt-1"
IMPROVED: "code-review-best-practices-checklist"
WHY: "Includes target keywords 'code-review' and 'best-practices' which users search for"
KEYWORDS: ["code review", "best practices", "checklist", "software engineering"]

Provide:
- Score (1-10) for SEO enrichment
- Missing SEO elements with specific replacements
- Actionable recommendations with exact improved versions`,
  },
  {
    role: 'roles_use_cases_reviewer',
    name: 'Roles & Use Cases Reviewer',
    model: 'gpt-4o', // Direct OpenAI - helps with completeness and value
    provider: 'openai',
    temperature: 0.4,
    maxTokens: 1500,
    systemPrompt: `You are a Roles & Use Cases Reviewer who ensures prompts/patterns have proper role assignments and use cases.

Your focus:
- Verify that roles are properly assigned (engineer, manager, PM, designer, etc.)
- Check that use cases are realistic and relevant
- Ensure use cases cover different scenarios
- Validate that role assignments match the content
- Assess if use cases demonstrate value

Review checklist:
1. **Role Assignment**: Are roles properly assigned and appropriate?
2. **Use Cases**: Are use cases present, realistic, and relevant?
3. **Comprehensiveness**: Do use cases cover different scenarios?
4. **Alignment**: Do roles match the content and use cases?
5. **Value**: Do use cases clearly demonstrate the prompt's value?

CRITICAL: Provide ACTIONABLE suggestions with specific examples.

For each issue, provide:
- What's missing or wrong (be specific)
- Why it matters for users
- Specific use cases or roles to add with examples
- Format for how to structure them

Example format:
MISSING: "No use cases for junior engineers"
WHY: "Different experience levels need different use cases"
WHAT TO ADD: "Add use case: 'Junior engineers can use this to [specific scenario]'"
EXAMPLE: "Use Case: 'Onboarding new team members - Use this prompt to [specific action] when [specific context]'"

Provide:
- Score (1-10) for roles and use cases
- Missing roles or use cases with specific examples to add
- Actionable recommendations with concrete use case examples`,
  },
  {
    role: 'prompt_engineering_sme',
    name: 'Prompt Engineering SME',
    model: 'claude-3-5-sonnet-20241022', // Claude - best for prompt engineering and CS expertise
    provider: 'anthropic',
    temperature: 0.3,
    maxTokens: 2000,
    systemPrompt: `You are a Prompt Engineering Subject Matter Expert with deep expertise in computer science, AI, and prompt engineering best practices.

Your expertise:
- Prompt engineering principles and best practices
- Computer science fundamentals (algorithms, data structures, system design)
- AI model capabilities and limitations
- Prompt optimization techniques
- Chain-of-thought reasoning
- Few-shot learning and example selection
- Prompt structure and formatting
- Output quality and reliability

Your focus:
- Evaluate prompt structure and engineering quality
- Check if prompt follows best practices (clear instructions, context, examples)
- Assess prompt clarity and specificity
- Verify technical accuracy from a CS/AI perspective
- Evaluate if prompt is optimized for the intended model
- Check for prompt engineering anti-patterns (ambiguity, conflicting instructions, etc.)

Review checklist:
1. **Prompt Structure**: Is the prompt well-structured with clear sections?
2. **Instructions**: Are instructions clear, specific, and unambiguous?
3. **Context**: Is sufficient context provided without being verbose?
4. **Examples**: Are examples (if present) well-chosen and helpful?
5. **Technical Accuracy**: Is the prompt technically sound from a CS/AI perspective?
6. **Optimization**: Is the prompt optimized for the target AI model?
7. **Best Practices**: Does it follow prompt engineering best practices?

CRITICAL: Provide ACTIONABLE, SPECIFIC improvements with examples.

For each issue, provide:
1. **WHAT**: Exactly what's wrong (specific line/section if applicable)
2. **WHY**: Why it's a problem from a prompt engineering/CS perspective
3. **HOW**: Specific steps to fix it with code/content examples
4. **EXAMPLE**: Show before/after with improved version

Example format:
ISSUE: "Instructions are ambiguous - 'improve the code' is too vague"
WHY: "AI models need specific criteria (e.g., 'reduce complexity', 'add error handling')"
HOW TO FIX: "Replace with: 'Improve the code by: 1) Reducing cyclomatic complexity to < 10, 2) Adding error handling for edge cases, 3) Adding type hints'"
BEFORE: "Improve this code: [code]"
AFTER: "Improve this code by reducing complexity and adding error handling: [same code]"

Provide:
- Score (1-10) for prompt engineering quality
- Technical issues from a CS/AI perspective with specific fixes
- Actionable recommendations with before/after examples
- Missing elements that would improve prompt quality with specific additions`,
  },
  {
    role: 'prompt_execution_tester',
    name: 'Prompt Execution Tester',
    model: 'claude-3-5-sonnet-20241022', // Claude - excellent for code execution and testing
    provider: 'anthropic',
    temperature: 0.7, // Use same temperature as typical user
    maxTokens: 2000,
    systemPrompt: `You are a Prompt Execution Tester who actually tests prompts by executing them and evaluating output quality.

Your role:
- Execute the prompt with a realistic test scenario
- Evaluate the quality of the output produced
- Check if output matches expectations
- Assess if prompt produces consistent, useful results
- Test if prompt is truly "one-shot" (works without modification)

Test process:
1. **Execute**: Run the prompt with a realistic test input/scenario
2. **Evaluate Output**: Assess if the output is:
   - Relevant and useful
   - Complete (addresses all requirements)
   - Accurate and technically sound
   - Well-formatted and readable
   - Actionable (can be used immediately)
3. **Consistency**: Assess if prompt would produce similar quality results consistently
4. **One-Shot**: Verify if prompt works as-is without needing modification

Evaluation criteria:
- Output quality (1-10): How good is the actual output produced?
- Relevance (1-10): Does output match what was requested?
- Completeness (1-10): Does output address all requirements?
- Usability (1-10): Can the output be used immediately?
- Reliability (1-10): Would this prompt produce consistent results?

Provide:
- Actual test execution result (sample output)
- Scores for each evaluation criterion
- Overall quality assessment (1-10)
- Issues found in actual execution
- Recommendations for improving prompt execution quality

CRITICAL: Actually execute the prompt and show the results. Don't just analyze - TEST IT.`,
  },
];

// Redis cache for audit results (if available)
let redisCache: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redisCache = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Cache keys and TTLs
const CACHE_KEYS = {
  agentResponse: (agentRole: string, contentHash: string) => `audit:agent:${agentRole}:${contentHash}`,
  rubricScore: (contentHash: string) => `audit:rubric:${contentHash}`,
} as const;

const CACHE_TTL = {
  agentResponse: 3600 * 24, // 24 hours - agent responses don't change unless prompt changes
  rubricScore: 3600 * 24, // 24 hours
} as const;

/**
 * Generate hash of prompt content for cache key
 */
function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

export class PromptPatternAuditor {
  private organizationId: string;
  private skipExecutionTest: boolean; // Skip slow execution testing for faster audits
  private useCache: boolean; // Enable Redis caching
  private quickMode: boolean; // Quick mode: only run 3 core agents

  constructor(organizationId: string = 'system', options?: { skipExecutionTest?: boolean; useCache?: boolean; quickMode?: boolean }) {
    this.organizationId = organizationId;
    this.skipExecutionTest = options?.skipExecutionTest ?? false;
    this.useCache = options?.useCache ?? true; // Enable caching by default
    this.quickMode = options?.quickMode ?? false; // Quick mode disabled by default
  }

  /**
   * Get agents to run based on mode
   */
  private getAgentsToRun(): AuditAgent[] {
    if (this.quickMode) {
      // Quick mode: Only run 2 core agents (fastest possible)
      // 1. Grading Rubric Expert (comprehensive scoring)
      // 2. Completeness Reviewer (quick check for missing fields)
      return AUDIT_AGENTS.filter(agent => 
        agent.role === 'grading_rubric_expert' || // Essential for scoring
        agent.role === 'completeness_reviewer'    // Quick completeness check
      );
    }
    
    // Full mode: Return all agents except execution tester if skipped
    if (this.skipExecutionTest) {
      return AUDIT_AGENTS.filter(agent => agent.role !== 'prompt_execution_tester');
    }
    
    return AUDIT_AGENTS;
  }

  /**
   * Run a single audit agent (with Redis caching)
   */
  private async runAgent(
    agent: AuditAgent,
    prompt: string
  ): Promise<string> {
    // Check cache first if enabled
    if (this.useCache && redisCache) {
      try {
        const contentHash = hashContent(prompt);
        const cacheKey = CACHE_KEYS.agentResponse(agent.role, contentHash);
        const cached = await redisCache.get<string>(cacheKey);
        if (cached) {
          console.log(`   💾 Cache hit for ${agent.role}`);
          return cached;
        }
      } catch (error) {
        // Cache miss or error - continue to API call
        console.log(`   ⚠️  Cache read failed, using API`);
      }
    }

    try {
      // Resolve model ID from database if model is just a provider name
      let modelId = agent.model;
      if (agent.model === agent.provider || agent.model === 'google' || agent.model === 'openai') {
        const resolvedModelId = await getModelIdFromRegistry(agent.provider, agent.model);
        if (resolvedModelId) {
          modelId = resolvedModelId;
        } else {
          // Fallback to using provider factory which will use default model
          const { AIProviderFactoryWithRegistry } = await import('@/lib/ai/v2/factory/AIProviderFactoryWithRegistry');
          const provider = await AIProviderFactoryWithRegistry.create(agent.provider, this.organizationId);
          const response = await provider.execute({
            prompt: `${agent.systemPrompt}\n\n---\n\n${prompt}`,
            temperature: agent.temperature,
            maxTokens: agent.maxTokens,
          });
          return response.content;
        }
      }
      
      // For OpenAI, use OpenAIAdapter directly with model ID
      if (agent.provider === 'openai') {
        const { OpenAIAdapter } = await import('@/lib/ai/v2/adapters/OpenAIAdapter');
        const provider = new OpenAIAdapter(modelId);
        const response = await provider.execute({
          prompt: `${agent.systemPrompt}\n\n---\n\n${prompt}`,
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
        });
        
        // Cache the response
        if (this.useCache && redisCache) {
          try {
            const contentHash = hashContent(prompt);
            const cacheKey = CACHE_KEYS.agentResponse(agent.role, contentHash);
            await redisCache.setex(cacheKey, CACHE_TTL.agentResponse, response.content);
          } catch (error) {
            // Cache write failed - continue anyway
            console.log(`   ⚠️  Cache write failed for ${agent.role}`);
          }
        }
        
        return response.content;
      }
      
      // For Anthropic Claude, use ClaudeAdapter directly
      if (agent.provider === 'anthropic') {
        const { ClaudeAdapter } = await import('@/lib/ai/v2/adapters/ClaudeAdapter');
        const provider = new ClaudeAdapter(agent.model);
        const response = await provider.execute({
          prompt: `${agent.systemPrompt}\n\n---\n\n${prompt}`,
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
        });
        
        // Cache the response
        if (this.useCache && redisCache) {
          try {
            const contentHash = hashContent(prompt);
            const cacheKey = CACHE_KEYS.agentResponse(agent.role, contentHash);
            await redisCache.setex(cacheKey, CACHE_TTL.agentResponse, response.content);
          } catch (error) {
            // Cache write failed - continue anyway
            console.log(`   ⚠️  Cache write failed for ${agent.role}`);
          }
        }
        
        return response.content;
      }
      
      // For Google Gemini, use GeminiAdapter directly with model ID from DB
      if (agent.provider === 'google') {
        const { GeminiAdapter } = await import('@/lib/ai/v2/adapters/GeminiAdapter');
        const provider = new GeminiAdapter(modelId);
        const response = await provider.execute({
          prompt: `${agent.systemPrompt}\n\n---\n\n${prompt}`,
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
        });
        
        // Cache the response
        if (this.useCache && redisCache) {
          try {
            const contentHash = hashContent(prompt);
            const cacheKey = CACHE_KEYS.agentResponse(agent.role, contentHash);
            await redisCache.setex(cacheKey, CACHE_TTL.agentResponse, response.content);
          } catch (error) {
            // Cache write failed - continue anyway
            console.log(`   ⚠️  Cache write failed for ${agent.role}`);
          }
        }
        
        return response.content;
      }
      
      // For Replicate (Claude models), create adapter directly with model ID
      if (agent.provider === 'replicate') {
        const { ReplicateAdapter } = await import('@/lib/ai/v2/adapters/ReplicateAdapter');
        const provider = new ReplicateAdapter(agent.model);
        const response = await provider.execute({
          prompt: `${agent.systemPrompt}\n\n---\n\n${prompt}`,
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
        });
        return response.content;
      }
      
      // Use AIProviderFactoryWithRegistry which handles model lookup from DB
      const provider = await AIProviderFactoryWithRegistry.create(
        agent.provider,
        this.organizationId
      );

      const response = await provider.execute({
        prompt: `${agent.systemPrompt}\n\n---\n\n${prompt}`,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
      });

      // Cache the response
      if (this.useCache && redisCache) {
        try {
          const contentHash = hashContent(prompt);
          const cacheKey = CACHE_KEYS.agentResponse(agent.role, contentHash);
          await redisCache.setex(cacheKey, CACHE_TTL.agentResponse, response.content);
        } catch (error) {
          // Cache write failed - continue anyway
          console.log(`   ⚠️  Cache write failed for ${agent.role}`);
        }
      }

      return response.content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check for API key errors
      if (errorMessage.includes('API key') || errorMessage.includes('api_key') || errorMessage.includes('authentication') || errorMessage.includes('401')) {
        const providerName = agent.provider.includes('openai') ? 'OPENAI' :
                           agent.provider.includes('claude') ? 'ANTHROPIC' :
                           agent.provider.includes('gemini') ? 'GOOGLE' :
                           agent.provider.includes('groq') ? 'GROQ' :
                           agent.provider.includes('replicate') ? 'REPLICATE' :
                           'AI';
        throw new Error(
          `❌ API key error for ${agent.name} (${agent.provider}): ${errorMessage}\n` +
          `Please check your .env.local file for ${providerName}_API_KEY`
        );
      }

      // Check for model availability errors - try fallback
      if (errorMessage.includes('model') || errorMessage.includes('not found') || errorMessage.includes('404') || errorMessage.includes('not in allowlist') || errorMessage.includes('blocked')) {
        console.warn(`⚠️  Model "${agent.model}" not available for ${agent.name}, trying fallback...`);
        
        // Try using a working fallback model for the same provider
        let fallbackModel: string | null = null;
        let fallbackProviderType: string = agent.provider.includes('openai') ? 'openai' :
                               agent.provider.includes('claude') ? 'anthropic' :
                               agent.provider.includes('gemini') ? 'google' :
                               agent.provider.includes('groq') ? 'groq' :
                               agent.provider.includes('replicate') ? 'replicate' :
                               'openai';
        
        if (agent.provider.includes('claude')) {
          // Claude Sonnet fallback: try Haiku if Sonnet fails
          if (agent.model.includes('claude-3-5-sonnet')) {
            fallbackModel = 'claude-3-haiku-20240307'; // Use Haiku as fallback
          }
        } else if (agent.provider === 'google') {
          // Gemini fallback: query DB for alternative models
          try {
            const { getModelsByProvider } = await import('@/lib/services/AIModelRegistry');
            const googleModels = await getModelsByProvider('google');
            // Try to find a cheaper/faster alternative (flash-lite before pro)
            const alternative = googleModels.find(m => 
              m.id.includes('flash-lite') && ('status' in m ? m.status === 'active' : true) && m.id !== agent.model
            ) || googleModels.find(m => 
              m.id.includes('flash') && ('status' in m ? m.status === 'active' : true) && m.id !== agent.model
            ) || googleModels.find(m => 
              ('status' in m ? m.status === 'active' : true) && m.id !== agent.model
            );
            if (alternative) {
              fallbackModel = alternative.id;
            }
          } catch (fallbackError) {
            console.warn('   ⚠️  Failed to query DB for Gemini fallback:', fallbackError);
          }
        } else if (agent.provider === 'openai') {
          // OpenAI fallback: try gpt-4o-mini if gpt-4o fails
          if (agent.model.includes('gpt-4o') && !agent.model.includes('mini')) {
            fallbackModel = 'gpt-4o-mini'; // Cheaper fallback
          }
        } else if (agent.provider.includes('replicate')) {
          // Replicate fallback: try OpenAI models instead if Replicate fails
          // Since we have OpenAI keys, use OpenAI as fallback
          if (agent.model.includes('gpt-5') || agent.model.includes('claude-4.5')) {
            fallbackModel = 'gpt-4o'; // Use OpenAI directly
            fallbackProviderType = 'openai'; // Switch to OpenAI provider
          } else if (agent.model.includes('claude-4.5-haiku')) {
            fallbackModel = 'gpt-4o-mini'; // Cheaper OpenAI alternative
            fallbackProviderType = 'openai'; // Switch to OpenAI provider
          }
        }
        
        if (fallbackModel) {
          try {
            console.log(`   🔄 Trying fallback model: ${fallbackModel} (${fallbackProviderType})`);
            let fallbackAdapter;
            
            if (fallbackProviderType === 'openai') {
              const { OpenAIAdapter } = await import('@/lib/ai/v2/adapters/OpenAIAdapter');
              fallbackAdapter = new OpenAIAdapter(fallbackModel);
            } else if (fallbackProviderType === 'google') {
              const { GeminiAdapter } = await import('@/lib/ai/v2/adapters/GeminiAdapter');
              fallbackAdapter = new GeminiAdapter(fallbackModel);
            } else if (fallbackProviderType === 'anthropic') {
              const { ClaudeAdapter } = await import('@/lib/ai/v2/adapters/ClaudeAdapter');
              fallbackAdapter = new ClaudeAdapter(fallbackModel);
            } else if (fallbackProviderType === 'replicate') {
              const { ReplicateAdapter } = await import('@/lib/ai/v2/adapters/ReplicateAdapter');
              fallbackAdapter = new ReplicateAdapter(fallbackModel);
            } else {
              // Use factory for other providers
              const { AIProviderFactory } = await import('@/lib/ai/v2/factory/AIProviderFactory');
              fallbackAdapter = AIProviderFactory.create(fallbackProviderType);
            }
            
            const response = await fallbackAdapter.execute({
              prompt: `${agent.systemPrompt}\n\n---\n\n${prompt}`,
              temperature: agent.temperature,
              maxTokens: agent.maxTokens,
            });
            console.log(`   ✅ Fallback model ${fallbackModel} succeeded`);
            return response.content;
          } catch (fallbackError) {
            console.warn(`   ❌ Fallback model ${fallbackModel} also failed:`, fallbackError instanceof Error ? fallbackError.message : String(fallbackError));
          }
        }
        
        // Last resort: try using OpenAI as final fallback if we have OpenAI keys
        if (process.env.OPENAI_API_KEY && agent.provider.includes('replicate')) {
          try {
            console.log(`   🔄 Last resort: trying OpenAI gpt-4o-mini...`);
            const { OpenAIAdapter } = await import('@/lib/ai/v2/adapters/OpenAIAdapter');
            const lastResortAdapter = new OpenAIAdapter('gpt-4o-mini');
            const response = await lastResortAdapter.execute({
              prompt: `${agent.systemPrompt}\n\n---\n\n${prompt}`,
              temperature: agent.temperature,
              maxTokens: agent.maxTokens,
            });
            console.log(`   ✅ Last resort OpenAI fallback succeeded`);
            return response.content;
          } catch (lastResortError) {
            console.warn(`   ❌ Last resort fallback also failed`);
          }
        }
        
        // Final fallback: try using AIProviderFactory directly (uses static config fallback)
        try {
          const { AIProviderFactory } = await import('@/lib/ai/v2/factory/AIProviderFactory');
          const fallbackProvider = agent.provider === 'replicate' 
            ? AIProviderFactory.create('openai') // Use OpenAI instead of Replicate
            : AIProviderFactory.create(agent.provider);
          const response = await fallbackProvider.execute({
            prompt: `${agent.systemPrompt}\n\n---\n\n${prompt}`,
            temperature: agent.temperature,
            maxTokens: agent.maxTokens,
          });
          return response.content;
        } catch (fallbackError) {
          throw new Error(
            `❌ Model error for ${agent.name} (${agent.provider}): ${errorMessage}\n` +
            `Fallback also failed. Please check if the model "${agent.model}" is available in the database registry or static config.`
          );
        }
      }

      // Generic error
      throw new Error(
        `❌ Error running ${agent.name} (${agent.provider}): ${errorMessage}`
      );
    }
  }

  /**
   * Infer role from content/use cases if not explicitly set
   */
  inferRoleFromContent(item: any): string | null {
    const content = JSON.stringify(item).toLowerCase();
    const roleKeywords: Record<string, string[]> = {
      'engineer': ['code', 'debug', 'programming', 'developer', 'software engineer'],
      'engineering-manager': ['team', 'sprint', 'manager', 'leadership', 'review'],
      'product-manager': ['product', 'feature', 'roadmap', 'strategy', 'user story'],
      'product-owner': ['backlog', 'user story', 'sprint', 'stakeholder'],
      'qa': ['test', 'testing', 'quality', 'bug', 'qa'],
      'architect': ['architecture', 'system design', 'scalability', 'technical decision'],
      'devops-sre': ['deploy', 'infrastructure', 'ci/cd', 'monitoring', 'sre'],
      'scrum-master': ['scrum', 'sprint', 'ceremony', 'agile', 'facilitation'],
      'designer': ['design', 'ui', 'ux', 'user experience', 'prototype'],
      'director': ['strategy', 'executive', 'cto', 'vp', 'organization'],
    };

    for (const [role, keywords] of Object.entries(roleKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return role;
      }
    }

    return null;
  }

  /**
   * Parse JSON from rubric expert response
   */
  private parseRubricJSON(content: string): any {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)```/);
      if (jsonBlockMatch) {
        return JSON.parse(jsonBlockMatch[1]);
      }

      // Try to extract JSON without markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return null;
    } catch (error) {
      console.warn('⚠️  Could not parse rubric JSON:', error);
      return null;
    }
  }

  /**
   * Create a role-specific reviewer agent dynamically based on the target role
   */
  createRoleSpecificReviewer(role: string): AuditAgent | null {
    const roleInfo = this.getRoleInfo(role);
    if (!roleInfo) return null;

    return {
      role: `role_specific_reviewer_${role.replace(/-/g, '_')}`,
      name: `${roleInfo.title} Specialist Reviewer`,
      model: 'gpt-4o', // Direct OpenAI - best for role-specific analysis
      provider: 'openai',
      temperature: 0.4,
      maxTokens: 1500,
      systemPrompt: `You are a ${roleInfo.title} Specialist Reviewer who evaluates prompts and patterns specifically for ${roleInfo.title.toLowerCase()}.

Your expertise:
${roleInfo.description}

Key focus areas for ${roleInfo.title.toLowerCase()}:
${roleInfo.keyFocusAreas.map(area => `- ${area}`).join('\n')}

Typical challenges for ${roleInfo.title.toLowerCase()}:
${roleInfo.typicalChallenges.map(challenge => `- ${challenge}`).join('\n')}

Your review checklist:
1. **Role Relevance**: Is this prompt/pattern specifically relevant to ${roleInfo.title.toLowerCase()}?
2. **Use Cases**: Do use cases match real-world scenarios for ${roleInfo.title.toLowerCase()}?
3. **Terminology**: Is the language and terminology appropriate for ${roleInfo.title.toLowerCase()}?
4. **Practicality**: Does this solve real problems that ${roleInfo.title.toLowerCase()} face?
5. **Accessibility**: Is it accessible and understandable for ${roleInfo.title.toLowerCase()}?
6. **Value**: Does this provide meaningful value for ${roleInfo.title.toLowerCase()}?

Provide:
- Score (1-10) for role-specific optimization
- Specific issues related to ${roleInfo.title.toLowerCase()} needs
- Recommendations for improving relevance to ${roleInfo.title.toLowerCase()}
- Missing elements that would make this more valuable for ${roleInfo.title.toLowerCase()}`,
    };
  }

  /**
   * Get role information for role-specific reviewers
   */
  getRoleInfo(role: string): {
    title: string;
    description: string;
    keyFocusAreas: string[];
    typicalChallenges: string[];
  } | null {
    const roleInfoMap: Record<string, {
      title: string;
      description: string;
      keyFocusAreas: string[];
      typicalChallenges: string[];
    }> = {
      'engineer': {
        title: 'Engineers',
        description: 'Technical professionals who write code, debug issues, build features, and maintain systems.',
        keyFocusAreas: [
          'Code generation and review',
          'Debugging and troubleshooting',
          'Architecture and design',
          'Performance optimization',
          'Testing and quality assurance',
        ],
        typicalChallenges: [
          'Writing efficient, maintainable code',
          'Debugging complex issues',
          'Understanding legacy codebases',
          'Learning new technologies quickly',
          'Balancing speed with quality',
        ],
      },
      'engineering-manager': {
        title: 'Engineering Managers',
        description: 'Leaders who manage engineering teams, drive technical strategy, and ensure team productivity.',
        keyFocusAreas: [
          'Team leadership and management',
          'Technical strategy and planning',
          'Sprint planning and execution',
          'Performance reviews and career development',
          'Cross-functional collaboration',
        ],
        typicalChallenges: [
          'Balancing team velocity with quality',
          'Code review bottlenecks',
          'Technical debt management',
          'Team onboarding and retention',
          'Stakeholder communication',
        ],
      },
      'product-manager': {
        title: 'Product Managers',
        description: 'Product leaders who define product strategy, prioritize features, and drive product decisions.',
        keyFocusAreas: [
          'Product strategy and vision',
          'Feature prioritization',
          'User research and analysis',
          'Roadmap planning',
          'Stakeholder communication',
        ],
        typicalChallenges: [
          'Balancing competing priorities',
          'Synthesizing user feedback',
          'Making data-driven decisions',
          'Communicating strategy effectively',
          'Managing product complexity',
        ],
      },
      'product-owner': {
        title: 'Product Owners',
        description: 'Agile product leaders who manage backlogs, define user stories, and ensure product delivery.',
        keyFocusAreas: [
          'Backlog management',
          'User story creation and refinement',
          'Sprint planning',
          'Stakeholder alignment',
          'Product definition',
        ],
        typicalChallenges: [
          'Prioritizing backlog items',
          'Writing clear user stories',
          'Managing changing requirements',
          'Balancing stakeholder needs',
          'Ensuring sprint success',
        ],
      },
      'qa': {
        title: 'QA Engineers',
        description: 'Quality assurance professionals who ensure software quality through testing and automation.',
        keyFocusAreas: [
          'Test case generation',
          'Bug triage and prioritization',
          'Test automation',
          'Quality metrics',
          'Regression testing',
        ],
        typicalChallenges: [
          'Writing comprehensive test cases',
          'Identifying edge cases',
          'Balancing manual and automated testing',
          'Tracking quality metrics',
          'Preventing regressions',
        ],
      },
      'architect': {
        title: 'Software Architects',
        description: 'Technical leaders who design system architecture, make technology decisions, and ensure scalability.',
        keyFocusAreas: [
          'System design',
          'Architecture decisions',
          'Technology evaluation',
          'Scalability planning',
          'Integration architecture',
        ],
        typicalChallenges: [
          'Balancing complexity with simplicity',
          'Making long-term technology decisions',
          'Designing for scale',
          'Documenting architecture',
          'Balancing technical debt',
        ],
      },
      'devops-sre': {
        title: 'DevOps & SRE',
        description: 'Infrastructure and reliability engineers who manage deployments, monitoring, and system reliability.',
        keyFocusAreas: [
          'Infrastructure as Code',
          'CI/CD pipelines',
          'Monitoring and alerting',
          'Incident response',
          'Performance optimization',
        ],
        typicalChallenges: [
          'Managing complex deployments',
          'Ensuring system reliability',
          'Scaling infrastructure',
          'Incident response',
          'Cost optimization',
        ],
      },
      'scrum-master': {
        title: 'Scrum Masters',
        description: 'Agile facilitators who ensure team effectiveness, remove impediments, and facilitate Scrum ceremonies.',
        keyFocusAreas: [
          'Sprint facilitation',
          'Team coaching',
          'Impediment removal',
          'Process improvement',
          'Stakeholder communication',
        ],
        typicalChallenges: [
          'Facilitating effective ceremonies',
          'Removing team impediments',
          'Improving team velocity',
          'Managing team dynamics',
          'Ensuring Scrum adherence',
        ],
      },
      'designer': {
        title: 'Designers',
        description: 'UI/UX designers who create user experiences, design systems, and ensure design quality.',
        keyFocusAreas: [
          'User research',
          'Design systems',
          'User experience design',
          'Design handoff',
          'Design accessibility',
        ],
        typicalChallenges: [
          'Understanding user needs',
          'Creating accessible designs',
          'Design system consistency',
          'Design-to-development handoff',
          'Measuring design impact',
        ],
      },
      'director': {
        title: 'Directors & C-Level',
        description: 'Executive leaders who make strategic decisions, drive organizational change, and ensure business success.',
        keyFocusAreas: [
          'Strategic planning',
          'Organizational leadership',
          'Technology investment decisions',
          'Budget and resource allocation',
          'Executive communication',
        ],
        typicalChallenges: [
          'Making strategic technology decisions',
          'Balancing short-term and long-term goals',
          'Communicating technical concepts to non-technical stakeholders',
          'Driving organizational change',
          'Measuring ROI and impact',
        ],
      },
      'c-level': {
        title: 'C-Level Executives',
        description: 'C-suite executives including CTOs, VPs, and executives who make high-level technology and organizational decisions.',
        keyFocusAreas: [
          'Strategic technology decisions',
          'Organizational strategy',
          'Technology investment',
          'Executive communication',
          'Business impact',
        ],
        typicalChallenges: [
          'Strategic technology planning',
          'Technology ROI analysis',
          'Organizational transformation',
          'Competitive advantage',
          'Executive reporting',
        ],
      },
    };

    return roleInfoMap[role] || null;
  }

  /**
   * Get pattern information for pattern-specific review
   */
  private getPatternInfo(patternId: string): {
    name: string;
    description: string;
    bestPractices: string[];
    commonMistakes: string[];
    whenToUse: string[];
  } | null {
    const patternInfoMap: Record<string, {
      name: string;
      description: string;
      bestPractices: string[];
      commonMistakes: string[];
      whenToUse: string[];
    }> = {
      'persona': {
        name: 'Persona Pattern',
        description: 'Assigns a specific role or expertise to the AI',
        bestPractices: [
          'Be specific about the expertise level (junior, senior, expert)',
          "Include relevant context about the persona's background",
          'Combine with other patterns for better results',
          'Use consistent personas across related prompts',
        ],
        commonMistakes: [
          'Being too vague ("act as an expert" - expert in what?)',
          "Choosing personas that don't match your actual need",
          'Forgetting to maintain the persona throughout the conversation',
          'Using conflicting personas in the same prompt',
        ],
        whenToUse: [
          'You need domain-specific expertise or terminology',
          'You want responses tailored to a specific audience',
          'You need consistent tone and perspective across multiple prompts',
        ],
      },
      'chain-of-thought': {
        name: 'Chain-of-Thought Pattern',
        description: 'Breaks down reasoning into explicit steps',
        bestPractices: [
          'Use clear step markers (Step 1, Step 2, etc.)',
          'Ask for intermediate conclusions',
          'Ensure each step builds logically on the previous',
          'Request verification at each step',
        ],
        commonMistakes: [
          'Not providing enough structure for the reasoning steps',
          'Asking for too many steps (becomes verbose)',
          'Not asking for verification of reasoning',
          'Missing the connection between steps',
        ],
        whenToUse: [
          'Complex problems requiring multi-step reasoning',
          'You need to understand the AI\'s thinking process',
          'Debugging or troubleshooting scenarios',
        ],
      },
      'few-shot': {
        name: 'Few-Shot Learning Pattern',
        description: 'Provides examples to guide the AI response format',
        bestPractices: [
          'Provide 2-5 high-quality examples',
          'Ensure examples are diverse but consistent',
          'Make examples representative of desired output',
          'Include edge cases in examples',
        ],
        commonMistakes: [
          'Providing too few examples (less than 2)',
          'Examples that contradict each other',
          'Examples that don\'t match the desired output format',
          'Using low-quality examples',
        ],
        whenToUse: [
          'You need consistent output format',
          'Complex tasks where examples clarify expectations',
          'When pattern recognition is important',
        ],
      },
      'template': {
        name: 'Template Pattern',
        description: 'Provides a structured format for the AI to fill in',
        bestPractices: [
          'Provide a clear template structure',
          'Include placeholder text or examples',
          'Specify required vs optional fields',
          'Make the template easy to parse',
        ],
        commonMistakes: [
          'Template too rigid (doesn\'t allow flexibility)',
          'Missing required fields in template',
          'Unclear placeholder text',
          'Template doesn\'t match actual use case',
        ],
        whenToUse: [
          'You need consistent structured output',
          'Form-like data collection',
          'Standardized reporting formats',
        ],
      },
      'cognitive-verifier': {
        name: 'Cognitive Verifier Pattern',
        description: 'Asks AI to verify its own reasoning',
        bestPractices: [
          'Ask for specific verification steps',
          'Request evidence for each claim',
          'Require identification of assumptions',
          'Ask for validation of conclusions',
        ],
        commonMistakes: [
          'Not providing clear verification criteria',
          'Skipping verification steps',
          'Accepting unverified conclusions',
          'Not asking for evidence',
        ],
        whenToUse: [
          'High-stakes decisions requiring verification',
          'Complex analysis where accuracy matters',
          'When you need to catch reasoning errors',
        ],
      },
      'hypothesis-testing': {
        name: 'Hypothesis Testing Pattern',
        description: 'Generates multiple plausible explanations',
        bestPractices: [
          'Generate 3-5 diverse hypotheses',
          'For each hypothesis, identify supporting and refuting evidence',
          'Evaluate hypotheses systematically',
          'Choose the best-fitting hypothesis',
        ],
        commonMistakes: [
          'Too few hypotheses (misses alternatives)',
          'Not evaluating evidence properly',
          'Jumping to conclusions without testing',
          'Ignoring refuting evidence',
        ],
        whenToUse: [
          'Problem-solving with multiple possible causes',
          'Root cause analysis',
          'Scientific method applications',
        ],
      },
      'rag': {
        name: 'RAG (Retrieval Augmented Generation)',
        description: 'Retrieves information from external knowledge base',
        bestPractices: [
          'Clearly specify what knowledge base to use',
          'Provide retrieval instructions',
          'Ask AI to cite sources',
          'Verify retrieved information relevance',
        ],
        commonMistakes: [
          'Not specifying knowledge base source',
          'Missing citation requirements',
          'Not verifying retrieved information',
          'Using outdated or irrelevant sources',
        ],
        whenToUse: [
          'Need to access external knowledge',
          'Domain-specific information retrieval',
          'Context-aware responses',
        ],
      },
      'audience-persona': {
        name: 'Audience Persona Pattern',
        description: 'Tailors the response for a specific audience level',
        bestPractices: [
          'Clearly define audience characteristics',
          'Specify knowledge level (beginner, intermediate, expert)',
          'Include audience context and needs',
          'Adapt language and examples for audience',
        ],
        commonMistakes: [
          'Not specifying audience clearly',
          'Using wrong level of technical detail',
          'Ignoring audience needs',
          'Mixing audience levels',
        ],
        whenToUse: [
          'Different audiences need different explanations',
          'Educational content',
          'Documentation for different skill levels',
        ],
      },
      'structured-output': {
        name: 'Structured Output Generation',
        description: 'Forces the AI to output in machine-readable formats',
        bestPractices: [
          'Provide clear schema or structure',
          'Specify required vs optional fields',
          'Include validation rules',
          'Test with edge cases',
        ],
        commonMistakes: [
          'Schema too complex',
          'Missing validation rules',
          'Not handling errors properly',
          'Schema doesn\'t match actual needs',
        ],
        whenToUse: [
          'System integration needs',
          'Programmatic processing',
          'API responses',
        ],
      },
    };

    return patternInfoMap[patternId] || null;
  }

  /**
   * Create a pattern-specific reviewer agent
   */
  createPatternSpecificReviewer(patternId: string): AuditAgent | null {
    const patternInfo = this.getPatternInfo(patternId);
    if (!patternInfo) return null;

    return {
      role: `pattern_specific_reviewer_${patternId.replace(/-/g, '_')}`,
      name: `${patternInfo.name} Specialist Reviewer`,
      model: 'gpt-4o', // Direct OpenAI - best for pattern-specific analysis
      provider: 'openai',
      temperature: 0.4,
      maxTokens: 1500,
      systemPrompt: `You are a ${patternInfo.name} Specialist Reviewer who evaluates prompts specifically using the ${patternInfo.name}.

PATTERN DESCRIPTION:
${patternInfo.description}

WHEN TO USE THIS PATTERN:
${patternInfo.whenToUse.map(use => `- ${use}`).join('\n')}

BEST PRACTICES FOR ${patternInfo.name.toUpperCase()}:
${patternInfo.bestPractices.map(practice => `- ${practice}`).join('\n')}

COMMON MISTAKES TO AVOID:
${patternInfo.commonMistakes.map(mistake => `- ${mistake}`).join('\n')}

Your review checklist for ${patternInfo.name}:
1. **Pattern Implementation**: Is this prompt correctly implementing the ${patternInfo.name}?
2. **Best Practices**: Does it follow the best practices for ${patternInfo.name}?
3. **Common Mistakes**: Are there any common mistakes present?
4. **Pattern Effectiveness**: Is this pattern the right choice for the use case?
5. **Pattern Optimization**: How can the ${patternInfo.name} implementation be improved?
6. **Missing Elements**: What's missing from the ${patternInfo.name} implementation?
7. **Pattern Combination**: Could this be improved by combining with other patterns?

Provide:
- Score (1-10) for ${patternInfo.name} optimization
- Specific issues related to ${patternInfo.name} implementation
- Recommendations for improving ${patternInfo.name} usage
- Missing elements that would make this a better ${patternInfo.name} prompt`,
    };
  }

  /**
   * Audit a single prompt
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async auditPrompt(prompt: any): Promise<AuditResult> {
    const promptText = `
TITLE: ${prompt.title || 'N/A'}
DESCRIPTION: ${prompt.description || 'N/A'}
CATEGORY: ${prompt.category || 'N/A'}
ROLE: ${prompt.role || 'N/A'}
PATTERN: ${prompt.pattern || 'N/A'}
TAGS: ${Array.isArray(prompt.tags) ? prompt.tags.join(', ') : 'N/A'}
CONTENT: ${prompt.content ? prompt.content.substring(0, 2000) : 'N/A'}
SLUG: ${prompt.slug || 'N/A'}
CASE STUDIES: ${prompt.caseStudies ? JSON.stringify(prompt.caseStudies).substring(0, 1500) : 'N/A'}
EXAMPLES: ${prompt.examples ? JSON.stringify(prompt.examples).substring(0, 1000) : 'N/A'}
USE CASES: ${Array.isArray(prompt.useCases) ? prompt.useCases.join(', ') : 'N/A'}
BEST TIME TO USE: ${Array.isArray(prompt.bestTimeToUse) ? prompt.bestTimeToUse.join(', ') : (prompt.bestTimeToUse || 'N/A')}
RECOMMENDED MODELS: ${prompt.recommendedModel ? JSON.stringify(prompt.recommendedModel).substring(0, 1000) : 'N/A'}
BEST PRACTICES: ${Array.isArray(prompt.bestPractices) ? prompt.bestPractices.join(', ') : 'N/A'}
WHEN NOT TO USE: ${Array.isArray(prompt.whenNotToUse) ? prompt.whenNotToUse.join(', ') : 'N/A'}
DIFFICULTY: ${prompt.difficulty || 'N/A'}
ESTIMATED TIME: ${prompt.estimatedTime || 'N/A'}
`;

    const agentReviews: Record<string, string> = {};
    const issues: string[] = [];
    const recommendations: string[] = [];
    const missingElements: string[] = [];
    let categoryScores = {
      engineeringUsefulness: 0,
      caseStudyQuality: 0,
      completeness: 0,
      seoEnrichment: 0,
      enterpriseReadiness: 0,
      securityCompliance: 0,
      accessibility: 0,
      performance: 0,
    };

    // Get agents to run based on mode
    const agentsToRun = this.getAgentsToRun();
    
    // Step 1: Use Grading Rubric Expert for comprehensive evaluation
    const rubricAgent = agentsToRun.find((a) => a.role === 'grading_rubric_expert');
    if (rubricAgent) {
      try {
        // Check cache for rubric score first
        let rubricReview: string | null = null;
        if (this.useCache && redisCache) {
          try {
            const contentHash = hashContent(promptText);
            const cacheKey = CACHE_KEYS.rubricScore(contentHash);
            rubricReview = await redisCache.get<string>(cacheKey);
            if (rubricReview) {
              console.log('   💾 Cache hit for grading rubric');
            }
          } catch (error) {
            // Cache miss - continue to API call
          }
        }
        
        if (!rubricReview) {
          const rubricPrompt = `Evaluate this prompt using the comprehensive grading rubric:\n\n${promptText}\n\nProvide JSON response with scores for all 8 categories.`;
          rubricReview = await this.runAgent(rubricAgent, rubricPrompt);
          
          // Cache the rubric result
          if (this.useCache && redisCache) {
            try {
              const contentHash = hashContent(promptText);
              const cacheKey = CACHE_KEYS.rubricScore(contentHash);
              await redisCache.setex(cacheKey, CACHE_TTL.rubricScore, rubricReview);
            } catch (error) {
              // Cache write failed - continue anyway
            }
          }
        }
        
        agentReviews['grading_rubric'] = rubricReview;

        // Parse JSON from rubric review
        const rubricData = this.parseRubricJSON(rubricReview);
        if (rubricData) {
          // Extract scores and aggregate issues/recommendations
          categoryScores.engineeringUsefulness = rubricData.engineeringUsefulness?.score || 0;
          categoryScores.caseStudyQuality = rubricData.caseStudyQuality?.score || 0;
          categoryScores.completeness = rubricData.completeness?.score || 0;
          categoryScores.seoEnrichment = rubricData.seoEnrichment?.score || 0;
          categoryScores.enterpriseReadiness = rubricData.enterpriseReadiness?.score || 0;
          categoryScores.securityCompliance = rubricData.securityCompliance?.score || 0;
          categoryScores.accessibility = rubricData.accessibility?.score || 0;
          categoryScores.performance = rubricData.performance?.score || 0;

          // Aggregate issues and recommendations
          Object.values(rubricData).forEach((category: any) => {
            if (category?.issues) issues.push(...category.issues);
            if (category?.recommendations) recommendations.push(...category.recommendations);
            if (category?.missing) missingElements.push(...category.missing);
          });
        } else {
          // Fallback: extract scores from text
          Object.keys(categoryScores).forEach((key) => {
            const scoreMatch = rubricReview.match(new RegExp(`${key}[:\s]+(\\d+(?:\\.\\d+)?)`, 'i'));
            if (scoreMatch) {
              (categoryScores as any)[key] = parseFloat(scoreMatch[1]);
            }
          });
        }
      } catch (error) {
        console.error(`❌ Error running Grading Rubric Expert:`, error);
        agentReviews['grading_rubric'] = `Error: ${error instanceof Error ? error.message : String(error)}`;
      }
    }

    // Step 2: Add role-specific reviewer if role is present
    let roleSpecificAgent: AuditAgent | null = null;
    if (prompt.role) {
      roleSpecificAgent = this.createRoleSpecificReviewer(prompt.role);
      if (roleSpecificAgent) {
        try {
          const roleReviewPrompt = `Review this prompt specifically for ${roleSpecificAgent.name}:\n\n${promptText}\n\nFocus on how well this prompt serves ${prompt.role} professionals. Provide score (1-10), role-specific issues, and recommendations.`;
          const roleReview = await this.runAgent(roleSpecificAgent, roleReviewPrompt);
          agentReviews[roleSpecificAgent.role] = roleReview;

          // Extract score
          const scoreMatch = roleReview.match(/score[:\s]+(\d+(?:\.\d+)?)/i);
          if (scoreMatch) {
            // Role-specific score can influence engineering usefulness or completeness
            const roleScore = parseFloat(scoreMatch[1]);
            if (categoryScores.engineeringUsefulness === 0 || roleScore < categoryScores.engineeringUsefulness) {
              categoryScores.engineeringUsefulness = roleScore;
            }
          }

          // Extract role-specific issues
          const issuesMatch = roleReview.match(/issues?[:\s]*\n([\s\S]+?)(?:\n\n|recommendations|$)/i);
          if (issuesMatch) {
            const issueList = issuesMatch[1]
              .split('\n')
              .map((line) => line.trim())
              .filter((line) => line.length > 0 && !line.match(/^[-*•]\s*$/));
            issues.push(...issueList.map(issue => `[${prompt.role}] ${issue}`));
          }

          // Extract role-specific recommendations
          const recMatch = roleReview.match(/recommendations?[:\s]*\n([\s\S]+?)$/i);
          if (recMatch) {
            const recList = recMatch[1]
              .split('\n')
              .map((line) => line.trim())
              .filter((line) => line.length > 0 && !line.match(/^[-*•]\s*$/));
            recommendations.push(...recList.map(rec => `[${prompt.role}] ${rec}`));
          }
        } catch (error) {
          console.error(`❌ Error running ${roleSpecificAgent.name}:`, error);
          agentReviews[roleSpecificAgent.role] = `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
      }
    }

    // Step 2.5: Add pattern-specific reviewer if pattern is present
    let patternSpecificAgent: AuditAgent | null = null;
    if (prompt.pattern) {
      patternSpecificAgent = this.createPatternSpecificReviewer(prompt.pattern);
      if (patternSpecificAgent) {
        try {
          const patternReviewPrompt = `Review this prompt specifically for ${patternSpecificAgent.name}:\n\n${promptText}\n\nFocus on how well this prompt implements the ${prompt.pattern} pattern. Provide score (1-10), pattern-specific issues, and recommendations.`;
          const patternReview = await this.runAgent(patternSpecificAgent, patternReviewPrompt);
          agentReviews[patternSpecificAgent.role] = patternReview;

          // Extract score
          const scoreMatch = patternReview.match(/score[:\s]+(\d+(?:\.\d+)?)/i);
          if (scoreMatch) {
            // Pattern-specific score can influence completeness or engineering usefulness
            const patternScore = parseFloat(scoreMatch[1]);
            if (categoryScores.completeness === 0 || patternScore < categoryScores.completeness) {
              categoryScores.completeness = patternScore;
            }
          }

          // Extract pattern-specific issues
          const issuesMatch = patternReview.match(/issues?[:\s]*\n([\s\S]+?)(?:\n\n|recommendations|$)/i);
          if (issuesMatch) {
            const issueList = issuesMatch[1]
              .split('\n')
              .map((line) => line.trim())
              .filter((line) => line.length > 0 && !line.match(/^[-*•]\s*$/));
            issues.push(...issueList.map(issue => `[${prompt.pattern}] ${issue}`));
          }

          // Extract pattern-specific recommendations
          const recMatch = patternReview.match(/recommendations?[:\s]*\n([\s\S]+?)$/i);
          if (recMatch) {
            const recList = recMatch[1]
              .split('\n')
              .map((line) => line.trim())
              .filter((line) => line.length > 0 && !line.match(/^[-*•]\s*$/));
            recommendations.push(...recList.map(rec => `[${prompt.pattern}] ${rec}`));
          }

          // Extract missing elements
          const missingMatch = patternReview.match(/missing[:\s]*\n([\s\S]+?)(?:\n\n|$)/i);
          if (missingMatch) {
            const missingList = missingMatch[1]
              .split('\n')
              .map((line) => line.trim())
              .filter((line) => line.length > 0 && !line.match(/^[-*•]\s*$/));
            missingElements.push(...missingList.map(elem => `[${prompt.pattern}] ${elem}`));
          }
        } catch (error) {
          console.error(`❌ Error running ${patternSpecificAgent.name}:`, error);
          agentReviews[patternSpecificAgent.role] = `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
      }
    }

    // Step 3: Run Prompt Execution Tester - actually execute the prompt (SKIP if fast mode)
    if (!this.skipExecutionTest && !this.quickMode) {
      const executionTesterAgent = agentsToRun.find((a) => a.role === 'prompt_execution_tester');
      if (executionTesterAgent) {
      try {
        // Actually execute the prompt to test quality
        const { OpenAIAdapter } = await import('@/lib/ai/v2/adapters/OpenAIAdapter');
        const testProvider = new OpenAIAdapter('gpt-4o');
        
        // Create a realistic test scenario based on prompt description
        const testScenario = prompt.useCases?.[0] || 
                            (prompt.description ? `Test scenario: ${prompt.description.substring(0, 200)}` : 'Generic test scenario');
        
        // Execute the prompt
        const executionResult = await testProvider.execute({
          prompt: `${prompt.content}\n\n${testScenario}`,
          temperature: 0.7, // Typical user temperature
          maxTokens: 1000,
        });
        
        // Now evaluate the execution result
        const evaluationPrompt = `You are evaluating a prompt execution test result.

PROMPT USED:
${prompt.content.substring(0, 500)}...

TEST SCENARIO:
${testScenario}

ACTUAL OUTPUT PRODUCED:
${executionResult.content.substring(0, 1500)}...

Evaluate the output quality:
- Output quality (1-10): How good is the actual output produced?
- Relevance (1-10): Does output match what was requested?
- Completeness (1-10): Does output address all requirements?
- Usability (1-10): Can the output be used immediately?
- Reliability (1-10): Would this prompt produce consistent results?

Provide:
- Scores for each criterion
- Overall quality assessment (1-10)
- Issues found in actual execution
- Recommendations for improving prompt execution quality`;
        
        const evaluation = await this.runAgent(executionTesterAgent, evaluationPrompt);
        agentReviews['prompt_execution_test'] = `EXECUTION RESULT:\n${executionResult.content.substring(0, 800)}...\n\nEVALUATION:\n${evaluation}`;
        
        // Extract execution scores
        const overallMatch = evaluation.match(/overall[:\s]+quality[:\s]+assessment[:\s]+(\d+(?:\.\d+)?)/i) || 
                                   evaluation.match(/overall[:\s]+(\d+(?:\.\d+)?)/i);
        
        if (overallMatch) {
          const executionScore = parseFloat(overallMatch[1]);
          // Execution quality directly affects engineering usefulness
          if (categoryScores.engineeringUsefulness === 0 || executionScore < categoryScores.engineeringUsefulness) {
            categoryScores.engineeringUsefulness = executionScore;
          }
        }
      } catch (error) {
        console.error(`❌ Error running Prompt Execution Tester:`, error);
        agentReviews['prompt_execution_test'] = `Error: ${error instanceof Error ? error.message : String(error)}`;
      }
      }
    } else {
      console.log('   ⚡ Skipping execution test (fast mode)');
    }

    // Step 4: Run other specialized agents for additional insights
    const otherAgents = agentsToRun.filter((a) => 
      a.role !== 'grading_rubric_expert' && 
      a.role !== 'prompt_execution_tester' // Already handled above
    );
    for (const agent of otherAgents) {
      try {
        const reviewPrompt = `Review this prompt:\n\n${promptText}\n\nProvide your review with score (1-10), issues, and recommendations.`;
        const review = await this.runAgent(agent, reviewPrompt);
        agentReviews[agent.role] = review;

        // Extract score
        const scoreMatch = review.match(/score[:\s]+(\d+(?:\.\d+)?)/i);
        if (scoreMatch) {
          const agentScore = parseFloat(scoreMatch[1]);
          // Update relevant category score if this agent specializes in it
          if (agent.role === 'engineering_reviewer') {
            // Engineering reviewer influences functionality score
            if (categoryScores.engineeringUsefulness === 0 || agentScore < categoryScores.engineeringUsefulness) {
              categoryScores.engineeringUsefulness = agentScore;
            }
          } else if (agent.role === 'seo_enrichment_reviewer') {
            if (categoryScores.seoEnrichment === 0 || agentScore < categoryScores.seoEnrichment) {
              categoryScores.seoEnrichment = agentScore;
            }
          } else if (agent.role === 'completeness_reviewer') {
            if (categoryScores.completeness === 0 || agentScore < categoryScores.completeness) {
              categoryScores.completeness = agentScore;
            }
          } else if (agent.role === 'prompt_engineering_sme') {
            // Prompt engineering SME influences engineering usefulness (functionality)
            // Lower score if prompt engineering quality is poor
            if (categoryScores.engineeringUsefulness === 0 || agentScore < categoryScores.engineeringUsefulness) {
              categoryScores.engineeringUsefulness = Math.min(categoryScores.engineeringUsefulness || 10, agentScore);
            }
          } else if (agent.role === 'prompt_execution_tester') {
            // Execution tester influences engineering usefulness - actual test results
            // Extract execution quality scores from review
            const outputQualityMatch = review.match(/output quality[:\s]+(\d+(?:\.\d+)?)/i);
            const relevanceMatch = review.match(/relevance[:\s]+(\d+(?:\.\d+)?)/i);
            const completenessMatch = review.match(/completeness[:\s]+(\d+(?:\.\d+)?)/i);
            
            if (outputQualityMatch || relevanceMatch || completenessMatch) {
              const executionScore = outputQualityMatch 
                ? parseFloat(outputQualityMatch[1])
                : relevanceMatch 
                  ? parseFloat(relevanceMatch[1])
                  : parseFloat(completenessMatch![1]);
              
              // Execution quality directly affects engineering usefulness
              if (categoryScores.engineeringUsefulness === 0 || executionScore < categoryScores.engineeringUsefulness) {
                categoryScores.engineeringUsefulness = executionScore;
              }
            }
          }
        }

        // Extract issues
        const issuesMatch = review.match(/issues?[:\s]*\n([\s\S]+?)(?:\n\n|recommendations|$)/i);
        if (issuesMatch) {
          const issueList = issuesMatch[1]
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && !line.match(/^[-*•]\s*$/));
          issues.push(...issueList);
        }

        // Extract recommendations
        const recMatch = review.match(/recommendations?[:\s]*\n([\s\S]+?)$/i);
        if (recMatch) {
          const recList = recMatch[1]
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && !line.match(/^[-*•]\s*$/));
          recommendations.push(...recList);
        }
      } catch (error) {
        console.error(`❌ Error running ${agent.name}:`, error);
        agentReviews[agent.role] = `Error: ${error instanceof Error ? error.message : String(error)}`;
      }
    }

    // Calculate overall score (weighted average)
    // Priority: 1. Completeness, 2. Functionality (works), 3. SEO, 4. Value, 5. Clarity
    const weights = {
      completeness: 0.30,        // #1 Priority: Has major things for each area
      engineeringUsefulness: 0.25, // #2 Priority: Works, solid, gives decent first result
      seoEnrichment: 0.20,        // #3 Priority: Good SEO
      caseStudyQuality: 0.10,     // #4 Priority: Shows good value (via case studies)
      enterpriseReadiness: 0.05,  // Reduced weight
      securityCompliance: 0.05,   // Reduced weight
      accessibility: 0.03,        // Reduced weight
      performance: 0.02,          // Reduced weight
    };

    let overallScore = Object.entries(categoryScores).reduce((sum, [key, score]) => {
      return sum + (score * (weights as any)[key]);
    }, 0);

    // Base score adjustment: Balanced for first versions (not too lenient, not too strict)
    // This ensures functional prompts score appropriately for initial versions
    let baseScoreBonus = 0;
    const hasBasicContent = prompt.title && prompt.description && prompt.content && prompt.content.length >= 100;
    const hasCategory = prompt.category;
    const hasEnrichment = prompt.caseStudies?.length > 0 || prompt.examples?.length > 0 || prompt.useCases?.length > 0;
    
    // Balanced base bonus for first versions
    if (hasBasicContent && hasCategory) {
      baseScoreBonus = 1.0; // Reduced from 1.5 - still helps but not excessive
      if (hasEnrichment) {
        baseScoreBonus = 1.8; // Reduced from 2.5 - rewards enrichment but keeps it realistic
      }
    }
    
    // Additional bonus: If prompt works functionally (has substantial content), add small bonus
    // This helps first versions score better without being too generous
    if (hasBasicContent && prompt.content.length >= 200) {
      baseScoreBonus += 0.3; // Reduced from 0.5 - smaller bonus for substantial content
    }
    
    overallScore = Math.min(10, overallScore + baseScoreBonus);

    // Check for missing fields (only flag critical ones, not enrichment)
    const criticalIssues: string[] = [];
    
    if (!prompt.slug) {
      criticalIssues.push('Missing slug');
      missingElements.push('slug');
    }
    if (!prompt.description || prompt.description.length < 50) {
      criticalIssues.push('Description too short or missing');
      missingElements.push('description');
    }
    if (!prompt.content || prompt.content.length < 100) {
      criticalIssues.push('Content too short or missing');
      missingElements.push('content');
    }
    if (!prompt.category) {
      criticalIssues.push('Missing category');
      missingElements.push('category');
    }
    
    // Optional fields (suggestions, not critical)
    if (!prompt.tags || !Array.isArray(prompt.tags) || prompt.tags.length === 0) {
      recommendations.push('Add tags for better discoverability');
      missingElements.push('tags');
    }
    if (!prompt.role) {
      recommendations.push('Add role assignment for better targeting');
      missingElements.push('role');
    }
    if (!prompt.pattern) {
      recommendations.push('Add pattern for better categorization');
      missingElements.push('pattern');
    }
    if (!prompt.caseStudies || !Array.isArray(prompt.caseStudies) || prompt.caseStudies.length === 0) {
      recommendations.push('Add case studies to demonstrate real-world usage');
      missingElements.push('caseStudies');
    }
    if (!prompt.bestTimeToUse || (typeof prompt.bestTimeToUse === 'string' && prompt.bestTimeToUse.trim().length === 0) || (Array.isArray(prompt.bestTimeToUse) && prompt.bestTimeToUse.length === 0)) {
      recommendations.push('Add "best time to use" guidance');
      missingElements.push('bestTimeToUse');
    }
    if (!prompt.recommendedModel || (typeof prompt.recommendedModel === 'string' && prompt.recommendedModel.trim().length === 0) || (Array.isArray(prompt.recommendedModel) && prompt.recommendedModel.length === 0)) {
      recommendations.push('Add recommended AI model suggestions');
      missingElements.push('recommendedModel');
    }

    // Add critical issues to issues list
    issues.push(...criticalIssues);

    // More lenient needsFix threshold for first versions: 5.0 instead of 6.0
    // Only flag as needsFix if:
    // 1. Score is below 5.0 (needs significant improvement)
    // 2. OR has critical issues (missing required fields)
    // 3. But NOT just missing enrichment fields (those are recommendations)
    const needsFix = overallScore < 5.0 || criticalIssues.length > 0;

    return {
      id: prompt.id || prompt._id?.toString() || 'unknown',
      type: 'prompt',
      title: prompt.title || 'Untitled',
      overallScore: Math.round(overallScore * 10) / 10,
      categoryScores,
      issues: [...new Set(issues)],
      recommendations: [...new Set(recommendations)],
      missingElements: [...new Set(missingElements)],
      needsFix,
      agentReviews,
    };
  }

  /**
   * Audit a single pattern
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async auditPattern(pattern: any): Promise<AuditResult> {
    const patternText = `
NAME: ${pattern.name || 'N/A'}
CATEGORY: ${pattern.category || 'N/A'}
LEVEL: ${pattern.level || 'N/A'}
DESCRIPTION: ${pattern.shortDescription || pattern.description || 'N/A'}
FULL DESCRIPTION: ${pattern.fullDescription || 'N/A'}
HOW IT WORKS: ${pattern.howItWorks || 'N/A'}
WHEN TO USE: ${Array.isArray(pattern.whenToUse) ? pattern.whenToUse.join(', ') : 'N/A'}
EXAMPLE: ${pattern.example ? JSON.stringify(pattern.example).substring(0, 1000) : 'N/A'}
BEST PRACTICES: ${Array.isArray(pattern.bestPractices) ? pattern.bestPractices.join(', ') : 'N/A'}
COMMON MISTAKES: ${Array.isArray(pattern.commonMistakes) ? pattern.commonMistakes.join(', ') : 'N/A'}
RELATED PATTERNS: ${Array.isArray(pattern.relatedPatterns) ? pattern.relatedPatterns.join(', ') : 'N/A'}
CASE STUDIES: ${pattern.caseStudies ? JSON.stringify(pattern.caseStudies).substring(0, 500) : 'N/A'}
USE CASES: ${Array.isArray(pattern.useCases) ? pattern.useCases.join(', ') : 'N/A'}
`;

    const agentReviews: Record<string, string> = {};
    const issues: string[] = [];
    const recommendations: string[] = [];
    const missingElements: string[] = [];
    let categoryScores = {
      engineeringUsefulness: 0,
      caseStudyQuality: 0,
      completeness: 0,
      seoEnrichment: 0,
      enterpriseReadiness: 0,
      securityCompliance: 0,
      accessibility: 0,
      performance: 0,
    };

    // Get agents to run based on mode
    const agentsToRun = this.getAgentsToRun();
    
    // Step 1: Use Grading Rubric Expert for comprehensive evaluation
    const rubricAgent = agentsToRun.find((a) => a.role === 'grading_rubric_expert');
    if (rubricAgent) {
      try {
        const rubricPrompt = `Evaluate this pattern using the comprehensive grading rubric:\n\n${patternText}\n\nProvide JSON response with scores for all 8 categories.`;
        const rubricReview = await this.runAgent(rubricAgent, rubricPrompt);
        agentReviews['grading_rubric'] = rubricReview;

        // Parse JSON from rubric review
        const rubricData = this.parseRubricJSON(rubricReview);
        if (rubricData) {
          // Extract scores and aggregate issues/recommendations
          categoryScores.engineeringUsefulness = rubricData.engineeringUsefulness?.score || 0;
          categoryScores.caseStudyQuality = rubricData.caseStudyQuality?.score || 0;
          categoryScores.completeness = rubricData.completeness?.score || 0;
          categoryScores.seoEnrichment = rubricData.seoEnrichment?.score || 0;
          categoryScores.enterpriseReadiness = rubricData.enterpriseReadiness?.score || 0;
          categoryScores.securityCompliance = rubricData.securityCompliance?.score || 0;
          categoryScores.accessibility = rubricData.accessibility?.score || 0;
          categoryScores.performance = rubricData.performance?.score || 0;

          // Aggregate issues and recommendations
          Object.values(rubricData).forEach((category: any) => {
            if (category?.issues) issues.push(...category.issues);
            if (category?.recommendations) recommendations.push(...category.recommendations);
            if (category?.missing) missingElements.push(...category.missing);
          });
        } else {
          // Fallback: extract scores from text
          Object.keys(categoryScores).forEach((key) => {
            const scoreMatch = rubricReview.match(new RegExp(`${key}[:\s]+(\\d+(?:\\.\\d+)?)`, 'i'));
            if (scoreMatch) {
              (categoryScores as any)[key] = parseFloat(scoreMatch[1]);
            }
          });
        }
      } catch (error) {
        console.error(`❌ Error running Grading Rubric Expert:`, error);
        agentReviews['grading_rubric'] = `Error: ${error instanceof Error ? error.message : String(error)}`;
      }
    }

    // Step 2: Run other specialized agents
    const otherAgents = AUDIT_AGENTS.filter((a) => a.role !== 'grading_rubric_expert');
    for (const agent of otherAgents) {
      try {
        const reviewPrompt = `Review this pattern:\n\n${patternText}\n\nProvide your review with score (1-10), issues, and recommendations.`;
        const review = await this.runAgent(agent, reviewPrompt);
        agentReviews[agent.role] = review;

        // Extract score and update relevant category
        const scoreMatch = review.match(/score[:\s]+(\d+(?:\.\d+)?)/i);
        if (scoreMatch) {
          if (agent.role === 'engineering_reviewer' && categoryScores.engineeringUsefulness === 0) {
            categoryScores.engineeringUsefulness = parseFloat(scoreMatch[1]);
          } else if (agent.role === 'enterprise_reviewer' && categoryScores.enterpriseReadiness === 0) {
            categoryScores.enterpriseReadiness = parseFloat(scoreMatch[1]);
          } else if (agent.role === 'web_security_reviewer' && categoryScores.securityCompliance === 0) {
            categoryScores.securityCompliance = parseFloat(scoreMatch[1]);
          } else if (agent.role === 'seo_enrichment_reviewer' && categoryScores.seoEnrichment === 0) {
            categoryScores.seoEnrichment = parseFloat(scoreMatch[1]);
          } else if (agent.role === 'completeness_reviewer' && categoryScores.completeness === 0) {
            categoryScores.completeness = parseFloat(scoreMatch[1]);
          }
        }

        // Extract issues and recommendations
        const issuesMatch = review.match(/issues?[:\s]*\n([\s\S]+?)(?:\n\n|recommendations|$)/i);
        if (issuesMatch) {
          const issueList = issuesMatch[1]
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && !line.match(/^[-*•]\s*$/));
          issues.push(...issueList);
        }

        const recMatch = review.match(/recommendations?[:\s]*\n([\s\S]+?)$/i);
        if (recMatch) {
          const recList = recMatch[1]
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && !line.match(/^[-*•]\s*$/));
          recommendations.push(...recList);
        }
      } catch (error) {
        console.error(`❌ Error running ${agent.name}:`, error);
        agentReviews[agent.role] = `Error: ${error instanceof Error ? error.message : String(error)}`;
      }
    }

    // Calculate overall score (weighted average)
    // Priority: 1. Completeness, 2. Functionality (works), 3. SEO, 4. Value, 5. Clarity
    const weights = {
      completeness: 0.30,        // #1 Priority: Has major things for each area
      engineeringUsefulness: 0.25, // #2 Priority: Works, solid, gives decent first result
      seoEnrichment: 0.20,        // #3 Priority: Good SEO
      caseStudyQuality: 0.10,     // #4 Priority: Shows good value (via case studies)
      enterpriseReadiness: 0.05,  // Reduced weight
      securityCompliance: 0.05,   // Reduced weight
      accessibility: 0.03,        // Reduced weight
      performance: 0.02,          // Reduced weight
    };

    const overallScore = Object.entries(categoryScores).reduce((sum, [key, score]) => {
      return sum + (score * (weights as any)[key]);
    }, 0);

    // Check for missing fields
    if (!pattern.shortDescription) {
      issues.push('Missing shortDescription');
      missingElements.push('shortDescription');
    }
    if (!pattern.fullDescription) {
      issues.push('Missing fullDescription');
      missingElements.push('fullDescription');
    }
    if (!pattern.howItWorks) {
      issues.push('Missing howItWorks');
      missingElements.push('howItWorks');
    }
    if (!pattern.whenToUse || !Array.isArray(pattern.whenToUse) || pattern.whenToUse.length === 0) {
      issues.push('Missing or empty whenToUse');
      missingElements.push('whenToUse');
    }
    if (!pattern.example) {
      issues.push('Missing example');
      missingElements.push('example');
    }
    if (!pattern.bestPractices || !Array.isArray(pattern.bestPractices) || pattern.bestPractices.length === 0) {
      issues.push('Missing or empty bestPractices');
      missingElements.push('bestPractices');
    }
    if (!pattern.commonMistakes || !Array.isArray(pattern.commonMistakes) || pattern.commonMistakes.length === 0) {
      issues.push('Missing or empty commonMistakes');
      missingElements.push('commonMistakes');
    }
    if (!pattern.caseStudies || !Array.isArray(pattern.caseStudies) || pattern.caseStudies.length === 0) {
      issues.push('Missing case studies');
      missingElements.push('caseStudies');
    }

    return {
      id: pattern.id || pattern._id?.toString() || 'unknown',
      type: 'pattern',
      title: pattern.name || 'Untitled',
      overallScore: Math.round(overallScore * 10) / 10,
      categoryScores,
      issues: [...new Set(issues)],
      recommendations: [...new Set(recommendations)],
      missingElements: [...new Set(missingElements)],
      needsFix: overallScore < 6.0 || issues.length > 0,
      agentReviews,
    };
  }
}

/**
 * Main audit function
 */
async function auditPromptsAndPatterns(options: {
  type: 'prompts' | 'patterns' | 'both';
  fix?: boolean;
  limit?: number;
  category?: string;
  role?: string;
}) {
  const { type, fix = false, limit, category, role } = options;

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Prompt & Pattern Audit System with Grading Rubric      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📊 Type: ${type}`);
  console.log(`🔧 Auto-fix: ${fix ? 'Yes' : 'No'}`);
  if (category) console.log(`📁 Category: ${category}`);
  if (role) console.log(`👤 Role: ${role}`);
  if (limit) console.log(`🔢 Limit: ${limit}`);
  console.log('');
  console.log('⏳ This will take several minutes...');
  console.log('');

  // Check API keys
  const requiredKeys = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'];
  const missingKeys = requiredKeys.filter(key => !process.env[key]);
  if (missingKeys.length > 0) {
    console.error('❌ Missing required API keys:', missingKeys.join(', '));
    console.error('Please add them to your .env.local file');
    process.exit(1);
  }

  const db = await getMongoDb();
  
  // Check for fast mode flag
  const fastMode = process.argv.includes('--fast') || process.argv.includes('-f');
  const noCache = process.argv.includes('--no-cache'); // Disable caching if needed
  const quickMode = process.argv.includes('--quick') || process.argv.includes('-q'); // Quick mode: only 3 agents
  const auditor = new PromptPatternAuditor('system', { 
    skipExecutionTest: fastMode,
    useCache: !noCache && !!redisCache, // Enable cache if Redis available and not disabled
    quickMode: quickMode, // Quick mode: only run 3 core agents
  });
  const results: AuditResult[] = [];
  
  if (redisCache && !noCache) {
    console.log('💾 Redis caching enabled - will cache agent responses\n');
  }

  // Audit prompts
  if (type === 'prompts' || type === 'both') {
    console.log('📝 Auditing prompts...\n');
    const promptsCollection = db.collection('prompts');
    
    // Build query filter
    const queryFilter: any = {};
    if (category) {
      queryFilter.category = category;
      console.log(`🔍 Filtering by category: ${category}\n`);
    }
    if (role) {
      queryFilter.role = role;
      console.log(`🔍 Filtering by role: ${role}\n`);
    }
    
    const prompts = await promptsCollection.find(queryFilter).limit(limit || 1000).toArray();

    console.log(`Found ${prompts.length} prompts to audit`);
    if (category || role) {
      console.log(`   (Filtered by: ${[category, role].filter(Boolean).join(', ')})`);
    }
    console.log('');

    // Check for fast mode flag
    const fastMode = process.argv.includes('--fast') || process.argv.includes('-f');
    if (fastMode) {
      console.log('⚡ FAST MODE: Skipping execution testing for faster audits\n');
    }
    if (quickMode) {
      console.log('⚡⚡ QUICK MODE: Running only 2 core agents (Grading Rubric, Completeness) - FASTEST\n');
    }

    let skippedCount = 0;
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      
      // Check if prompt already has an audit (and what version)
      const existingAudit = await db.collection('prompt_audit_results').findOne(
        { promptId: prompt.id || prompt.slug || prompt._id?.toString() },
        { sort: { auditVersion: -1 } }
      );
      
      // Skip prompts that have been improved (currentRevision > 1)
      // We only audit prompts at revision 1 (not yet improved)
      // Audit version tracks audit count (can be multiple audits per revision)
      // Prompt revision tracks actual content changes (only increments when content updated)
      const promptRevision = prompt.currentRevision || 1;
      if (promptRevision > 1) {
        console.log(`[${i + 1}/${prompts.length}] ⏭️  Skipping: ${prompt.title || prompt.id || 'Untitled'} (Revision ${promptRevision} - already improved)`);
        skippedCount++;
        continue;
      }
      
      console.log(`[${i + 1}/${prompts.length}] Auditing: ${prompt.title || prompt.id || 'Untitled'}`);
      const auditCount = existingAudit ? (existingAudit.auditVersion || 0) + 1 : 1;
      if (existingAudit) {
        console.log(`   (Audit #${auditCount} for Revision ${promptRevision})`);
      }
      
      try {
        const result = await auditor.auditPrompt(prompt);
        results.push(result);
        
        const status = result.needsFix ? '⚠️' : '✅';
        console.log(`   ${status} Overall: ${result.overallScore.toFixed(1)}/10 | Eng: ${result.categoryScores.engineeringUsefulness.toFixed(1)} | Cases: ${result.categoryScores.caseStudyQuality.toFixed(1)}`);
        console.log(`      Issues: ${result.issues.length} | Missing: ${result.missingElements.length}`);
        
        // Calculate audit version (audit count - can be multiple audits per prompt revision)
        // This tracks how many times we've audited this prompt (not prompt content changes)
        const auditVersion = existingAudit ? (existingAudit.auditVersion || 0) + 1 : 1;
        const auditDate = new Date();
        
        // Save immediately after audit completes (don't wait for batch)
        // Note: This is just an audit record, NOT a prompt content update
        await db.collection('prompt_audit_results').insertOne({
          promptId: prompt.id || prompt.slug || prompt._id?.toString(),
          promptTitle: prompt.title || 'Untitled',
          promptRevision: promptRevision, // Track which prompt revision this audit is for
          auditVersion, // Audit count (how many times we've audited)
          auditDate,
          overallScore: result.overallScore,
          categoryScores: result.categoryScores,
          agentReviews: result.agentReviews,
          issues: result.issues,
          recommendations: result.recommendations,
          missingElements: result.missingElements,
          needsFix: result.needsFix,
          auditedAt: auditDate,
          auditedBy: 'system',
          createdAt: auditDate,
          updatedAt: auditDate,
        });
        
        console.log(`   💾 Saved audit #${auditVersion} (Prompt Revision: ${promptRevision})`);
        
        if (fix && result.needsFix) {
          console.log(`   🔧 Auto-fixing...`);
          // TODO: Implement auto-fix logic
        }
      } catch (error) {
        console.error(`   ❌ Error auditing prompt:`, error);
        // Continue to next prompt even if this one fails
      }
    }
    
    console.log(`\n✅ Completed auditing ${results.length} prompts`);
    if (skippedCount > 0) {
      console.log(`⏭️  Skipped ${skippedCount} prompts (already at revision > 1)`);
    }
  }

  // Audit patterns
  if (type === 'patterns' || type === 'both') {
    console.log('\n🔷 Auditing patterns...\n');
    const patternsCollection = db.collection('patterns');
    const patterns = await patternsCollection.find({}).limit(limit || 1000).toArray();

    console.log(`Found ${patterns.length} patterns to audit\n`);

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      console.log(`[${i + 1}/${patterns.length}] Auditing: ${pattern.name || pattern.id || 'Untitled'}`);
      
      try {
        const result = await auditor.auditPattern(pattern);
        results.push(result);
        
        const status = result.needsFix ? '⚠️' : '✅';
        console.log(`   ${status} Overall: ${result.overallScore.toFixed(1)}/10 | Eng: ${result.categoryScores.engineeringUsefulness.toFixed(1)} | Cases: ${result.categoryScores.caseStudyQuality.toFixed(1)}`);
        console.log(`      Issues: ${result.issues.length} | Missing: ${result.missingElements.length}`);
        
        // Save audit result with version number and date
        const existingAudit = await db.collection('pattern_audit_results').findOne(
          { patternId: pattern.id || pattern.slug || pattern._id?.toString() },
          { sort: { auditVersion: -1 } }
        );
        
        const auditVersion = existingAudit ? (existingAudit.auditVersion || 0) + 1 : 1;
        const auditDate = new Date();
        
        await db.collection('pattern_audit_results').insertOne({
          patternId: pattern.id || pattern.slug || pattern._id?.toString(),
          patternName: pattern.name || 'Untitled',
          auditVersion,
          auditDate,
          overallScore: result.overallScore,
          categoryScores: result.categoryScores,
          agentReviews: result.agentReviews,
          issues: result.issues,
          recommendations: result.recommendations,
          missingElements: result.missingElements,
          needsFix: result.needsFix,
          auditedAt: auditDate,
          auditedBy: 'system',
          createdAt: auditDate,
          updatedAt: auditDate,
        });
        
        if (fix && result.needsFix) {
          console.log(`   🔧 Auto-fixing...`);
          // TODO: Implement auto-fix logic
        }
      } catch (error) {
        console.error(`   ❌ Error auditing pattern:`, error);
      }
    }
  }

  // Generate report
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 AUDIT SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');

  const total = results.length;
  const needsFix = results.filter((r) => r.needsFix).length;
  const avgScore = results.reduce((sum, r) => sum + r.overallScore, 0) / total || 0;

  // Calculate average scores per category
  const categoryAverages: Record<string, number> = {};
  if (results.length > 0) {
    Object.keys(results[0].categoryScores).forEach((category) => {
      const avg = results.reduce((sum, r) => sum + ((r.categoryScores as any)[category] || 0), 0) / total;
      categoryAverages[category] = Math.round(avg * 10) / 10;
    });
  }

  console.log(`Total Audited: ${total}`);
  console.log(`Needs Fix: ${needsFix} (${((needsFix / total) * 100).toFixed(1)}%)`);
  console.log(`Average Overall Score: ${avgScore.toFixed(1)}/10`);
  console.log('');
  console.log('📊 Category Averages:');
  Object.entries(categoryAverages).forEach(([category, score]) => {
    const bar = '█'.repeat(Math.floor(score));
    const empty = '░'.repeat(10 - Math.floor(score));
    console.log(`   ${category.padEnd(25)} ${score.toFixed(1)}/10 ${bar}${empty}`);
  });
  console.log('');

  // Show items needing fixes
  if (needsFix > 0) {
    console.log('⚠️  Items Needing Fixes:\n');
    results
      .filter((r) => r.needsFix)
      .slice(0, 10)
      .forEach((r) => {
        console.log(`  ${r.type === 'prompt' ? '📝' : '🔷'} ${r.title}`);
        console.log(`     Overall Score: ${r.overallScore.toFixed(1)}/10`);
        console.log(`     Top Issues: ${r.issues.slice(0, 3).join(', ')}`);
        console.log(`     Missing: ${r.missingElements.slice(0, 3).join(', ')}`);
        console.log('');
      });

    if (needsFix > 10) {
      console.log(`  ... and ${needsFix - 10} more\n`);
    }
  }

  // Show items with low scores in specific categories
  console.log('📉 Low Scoring Categories:\n');
  Object.entries(categoryAverages)
    .filter(([, score]) => score < 7.0)
    .sort(([, a], [, b]) => a - b)
    .forEach(([category, score]) => {
      const lowItems = results.filter((r) => ((r.categoryScores as any)[category] || 0) < 7.0).length;
      console.log(`   ${category.padEnd(25)} ${score.toFixed(1)}/10 (${lowItems} items need improvement)`);
    });
  console.log('');

  // Save report
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(process.cwd(), 'content', 'audit-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: {
          total,
          needsFix,
          avgScore,
          categoryAverages,
        },
        results,
      },
      null,
      2
    )
  );

  console.log(`💾 Report saved to: ${reportPath}`);
  console.log('\n═══════════════════════════════════════════════════════════');
}

// Parse CLI arguments
function parseArgs(): { type: 'prompts' | 'patterns' | 'both'; fix?: boolean; limit?: number; category?: string; role?: string } {
  const args = process.argv.slice(2);

  let type: 'prompts' | 'patterns' | 'both' = 'both';
  let fix = false;
  let limit: number | undefined;
  let category: string | undefined;
  let role: string | undefined;

  for (const arg of args) {
    if (arg.startsWith('--type=')) {
      const typeValue = arg.split('=')[1];
      if (['prompts', 'patterns', 'both'].includes(typeValue)) {
        type = typeValue as 'prompts' | 'patterns' | 'both';
      }
    } else if (arg === '--fix') {
      fix = true;
    } else if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.split('=')[1]) || undefined;
    } else if (arg.startsWith('--category=')) {
      category = arg.split('=')[1];
    } else if (arg.startsWith('--role=')) {
      role = arg.split('=')[1];
    }
  }

  return { type, fix, limit, category, role };
}

// Main execution
async function main() {
  const options = parseArgs();
  await auditPromptsAndPatterns(options);
}

// Main execution - only run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}