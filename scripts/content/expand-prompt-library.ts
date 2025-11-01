#!/usr/bin/env tsx
/**
 * Intelligent Prompt Library Expansion System
 * 
 * This script:
 * 1. Analyzes existing prompts to identify gaps in roles/personas
 * 2. Researches and generates 20+ new high-value prompts
 * 3. Recommends optimal prompt frameworks (CRAFT, KERNEL, etc.)
 * 4. Recommends optimal AI models per prompt type
 * 5. Red-hat reviews all prompts with scoring (1-10)
 * 6. Avoids duplication by checking existing prompts
 * 
 * Usage:
 *   pnpm exec tsx scripts/content/expand-prompt-library.ts --dry-run
 *   pnpm exec tsx scripts/content/expand-prompt-library.ts --analyze
 *   pnpm exec tsx scripts/content/expand-prompt-library.ts --generate=5
 *   pnpm exec tsx scripts/content/expand-prompt-library.ts --full
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';
import { AIProviderFactory } from '../../src/lib/ai/v2/factory/AIProviderFactory';
import { AIProvider } from '../../src/lib/ai/v2/interfaces/AIProvider';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PromptAnalysis {
  totalPrompts: number;
  existingRoles: string[];
  existingCategories: string[];
  existingPatterns: string[];
  gaps: {
    missingRoles: string[];
    underservedCategories: string[];
    complexityGaps: string[];
  };
}

interface PromptFramework {
  name: 'CRAFT' | 'KERNEL' | 'Chain-of-Thought' | 'Few-Shot' | 'Zero-Shot' | 'Persona';
  description: string;
  bestFor: string[];
  complexity: 'simple' | 'medium' | 'complex';
}

interface ModelRecommendation {
  model: string;
  provider: 'openai' | 'anthropic' | 'google';
  costPerCall: number;
  bestFor: string[];
  reasoning: string;
}

interface GeneratedPrompt {
  title: string;
  description: string;
  content: string;
  category: string;
  role: string;
  pattern: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  framework: PromptFramework;
  recommendedModel: ModelRecommendation;
  redHatScore: RedHatScore;
}

interface RedHatScore {
  skillLevel: number; // 1-10 (1=beginner friendly, 10=expert only)
  roleSpecificity: number; // 1-10 (1=general use, 10=very role-specific)
  usefulness: number; // 1-10 (1=easy without AI, 10=AI essential)
  optimization: number; // 1-10 (1=poorly optimized, 10=perfectly optimized)
  overall: number; // Average of above
  reasoning: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const COMPREHENSIVE_ROLES = [
  // Engineering
  'junior-engineer',
  'mid-engineer',
  'senior-engineer',
  'staff-engineer',
  'principal-engineer',
  'engineering-manager',
  'director-engineering',
  'vp-engineering',
  'cto',
  
  // Product
  'product-manager',
  'senior-product-manager',
  'product-director',
  'vp-product',
  'chief-product-officer',
  
  // Design
  'designer',
  'senior-designer',
  'design-lead',
  'design-director',
  
  // Operations
  'devops-engineer',
  'site-reliability-engineer',
  'platform-engineer',
  'security-engineer',
  
  // Quality
  'qa-engineer',
  'qa-lead',
  'test-automation-engineer',
  
  // Specialized
  'data-engineer',
  'data-scientist',
  'ml-engineer',
  'technical-writer',
  'developer-advocate',
  'solutions-architect',
];

const PROMPT_FRAMEWORKS: PromptFramework[] = [
  {
    name: 'CRAFT',
    description: 'Context, Role, Action, Format, Target - Structured approach',
    bestFor: ['code-generation', 'documentation', 'templates'],
    complexity: 'simple',
  },
  {
    name: 'KERNEL',
    description: 'Knowledge, Expectations, Role, Nuance, Examples, Limits - Enterprise framework',
    bestFor: ['complex-problems', 'high-stakes', 'production-ready'],
    complexity: 'complex',
  },
  {
    name: 'Chain-of-Thought',
    description: 'Step-by-step reasoning for complex problem-solving',
    bestFor: ['debugging', 'analysis', 'architecture', 'incident-response'],
    complexity: 'medium',
  },
  {
    name: 'Few-Shot',
    description: '2-5 examples to guide response format and style',
    bestFor: ['consistent-format', 'templated-output', 'style-matching'],
    complexity: 'medium',
  },
  {
    name: 'Zero-Shot',
    description: 'Direct instructions without examples - maximum creativity',
    bestFor: ['brainstorming', 'ideation', 'novel-problems'],
    complexity: 'simple',
  },
  {
    name: 'Persona',
    description: 'Assign specific role/expertise to AI',
    bestFor: ['domain-expertise', 'role-specific-advice', 'mentorship'],
    complexity: 'simple',
  },
];

const MODEL_RECOMMENDATIONS: ModelRecommendation[] = [
  {
    model: 'gpt-4o-mini',
    provider: 'openai',
    costPerCall: 0.0001,
    bestFor: ['simple-tasks', 'code-completion', 'formatting', 'basic-questions'],
    reasoning: 'Cheap and fast for straightforward tasks',
  },
  {
    model: 'gpt-4o',
    provider: 'openai',
    costPerCall: 0.005,
    bestFor: ['complex-code', 'architecture', 'multi-step-reasoning', 'production-code'],
    reasoning: 'Balanced cost/performance for most engineering tasks',
  },
  {
    model: 'gpt-4-turbo',
    provider: 'openai',
    costPerCall: 0.01,
    bestFor: ['large-context', 'refactoring', 'codebase-analysis'],
    reasoning: 'Large context window for analyzing entire files',
  },
  {
    model: 'o1-preview',
    provider: 'openai',
    costPerCall: 0.15,
    bestFor: ['complex-algorithms', 'system-design', 'critical-bugs', 'security-audits'],
    reasoning: 'Advanced reasoning for high-stakes, complex problems only',
  },
  {
    model: 'claude-3-haiku',
    provider: 'anthropic',
    costPerCall: 0.00025,
    bestFor: ['documentation', 'simple-edits', 'formatting'],
    reasoning: 'Very cheap for simple text tasks',
  },
  {
    model: 'claude-3-5-sonnet',
    provider: 'anthropic',
    costPerCall: 0.003,
    bestFor: ['code-generation', 'refactoring', 'technical-writing'],
    reasoning: 'Excellent at following complex instructions',
  },
  {
    model: 'gemini-1.5-flash',
    provider: 'google',
    costPerCall: 0.00015,
    bestFor: ['batch-processing', 'simple-analysis', 'content-generation'],
    reasoning: 'Extremely cheap for high-volume tasks',
  },
];

// ============================================================================
// STEP 1: ANALYZE EXISTING PROMPTS
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function analyzeExistingPrompts(db: any): Promise<PromptAnalysis> {
  console.log('\n📊 ANALYZING EXISTING PROMPT LIBRARY\n');
  console.log('=' .repeat(70));

  // Script context: Direct DB access needed for content migration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prompts = await db.collection('prompts').find({}).toArray();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingRoles = [...new Set(prompts.map((p: any) => p.role).filter(Boolean))];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingCategories = [...new Set(prompts.map((p: any) => p.category).filter(Boolean))];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingPatterns = [...new Set(prompts.map((p: any) => p.pattern).filter(Boolean))];
  
  console.log(`\n✅ Total prompts: ${prompts.length}`);
  console.log(`✅ Existing roles: ${existingRoles.length}`);
  console.log(`✅ Existing categories: ${existingCategories.length}`);
  console.log(`✅ Existing patterns: ${existingPatterns.length}`);

  // Identify missing roles
  const missingRoles = COMPREHENSIVE_ROLES.filter(role => !existingRoles.includes(role));
  
  console.log(`\n⚠️  Missing roles (${missingRoles.length}):`);
  missingRoles.slice(0, 10).forEach(role => console.log(`   - ${role}`));
  if (missingRoles.length > 10) console.log(`   ... and ${missingRoles.length - 10} more`);

  // Analyze category distribution
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoryDistribution = existingCategories.map(cat => ({
    category: cat,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    count: prompts.filter((p: any) => p.category === cat).length,
  })).sort((a, b) => a.count - b.count);

  console.log(`\n📈 Category distribution (least to most):`);
  categoryDistribution.slice(0, 5).forEach(({ category, count }) => 
    console.log(`   ${category}: ${count} prompts`)
  );

  return {
    totalPrompts: prompts.length,
    existingRoles,
    existingCategories,
    existingPatterns,
    gaps: {
      missingRoles,
      underservedCategories: categoryDistribution.slice(0, 3).map(c => c.category),
      complexityGaps: ['advanced-security', 'ml-ops', 'distributed-systems'],
    },
  };
}

// ============================================================================
// STEP 2: GENERATE NEW PROMPTS WITH AI
// ============================================================================

async function generateNewPrompts(
  analysis: PromptAnalysis,
  count: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingPrompts: any[]
): Promise<GeneratedPrompt[]> {
  console.log(`\n🤖 GENERATING ${count} NEW PROMPTS\n`);
  console.log('=' .repeat(70));

  // Use AIProviderFactory (DRY, follows ADR-001)
  const provider = AIProviderFactory.create('openai');
  
  // Create context about existing prompts to avoid duplication
  const existingTitles = existingPrompts.map(p => p.title).join('\n- ');
  const missingRolesStr = analysis.gaps.missingRoles.slice(0, 10).join(', ');

  const systemPrompt = `You are an expert prompt engineer and software development consultant. Your task is to generate NEW, high-value prompts for an engineering prompt library.

EXISTING PROMPTS TO AVOID DUPLICATING:
${existingTitles}

GAPS TO FILL:
- Missing roles: ${missingRolesStr}
- Underserved categories: ${analysis.gaps.underservedCategories.join(', ')}
- Complexity gaps: ${analysis.gaps.complexityGaps.join(', ')}

REQUIREMENTS:
1. Generate prompts that solve REAL engineering problems
2. Target specific roles (prefer missing roles)
3. Range from simple to complex
4. Include variety: debugging, architecture, management, DevOps, security, testing
5. Each prompt should be 80-90% complete (user customizes 10-20%)
6. Include concrete examples and structure
7. Use appropriate prompt frameworks (CRAFT, KERNEL, Chain-of-Thought, etc.)

OUTPUT FORMAT (JSON):
{
  "title": "Clear, descriptive title",
  "description": "One-sentence description of what it does",
  "content": "Full prompt text (200-500 words, structured)",
  "category": "engineering/management/product/design/devops/qa/security",
  "role": "specific role from missing roles list",
  "pattern": "craft/kernel/chain-of-thought/few-shot/zero-shot/persona",
  "tags": ["3-6 relevant tags"],
  "difficulty": "beginner/intermediate/advanced/expert",
  "estimatedUsefulness": 8 // 1-10 score
}`;

  const newPrompts: GeneratedPrompt[] = [];

  for (let i = 0; i < count; i++) {
    try {
      console.log(`\n[${i + 1}/${count}] Generating prompt...`);

      const userPrompt = `Generate 1 NEW prompt that fills a gap in our library. Focus on: ${analysis.gaps.missingRoles[i % analysis.gaps.missingRoles.length] || 'any missing role'}. Return ONLY valid JSON.`;

      const response = await provider.execute({
        prompt: userPrompt,
        systemPrompt: `${systemPrompt}\n\nIMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks.`,
        temperature: 0.8,
        maxTokens: 1000,
      });

      const generated = JSON.parse(response.content || '{}');
      
      // Determine best framework
      const framework = determineBestFramework(generated);
      
      // Determine best model
      const recommendedModel = determineBestModel(generated);
      
      // Red-hat review
      const redHatScore = await redHatReview(generated, provider);

      const fullPrompt: GeneratedPrompt = {
        ...generated,
        framework,
        recommendedModel,
        redHatScore,
      };

      newPrompts.push(fullPrompt);
      
      console.log(`   ✅ ${generated.title}`);
      console.log(`      Role: ${generated.role} | Category: ${generated.category}`);
      console.log(`      Framework: ${framework.name} | Model: ${recommendedModel.model}`);
      console.log(`      Red-Hat Score: ${redHatScore.overall.toFixed(1)}/10`);

    } catch (error) {
      console.error(`   ❌ Error generating prompt ${i + 1}:`, (error as Error).message);
    }
  }

  return newPrompts;
}

// ============================================================================
// STEP 3: FRAMEWORK RECOMMENDATION
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function determineBestFramework(prompt: any): PromptFramework {
  const { category, difficulty, role } = prompt;

  // Rule-based framework selection
  if (category === 'management' || difficulty === 'expert') {
    const framework = PROMPT_FRAMEWORKS.find(f => f.name === 'KERNEL');
    if (!framework) throw new Error('KERNEL framework not found');
    return framework;
  }

  if (category === 'debugging' || category === 'architecture') {
    const framework = PROMPT_FRAMEWORKS.find(f => f.name === 'Chain-of-Thought');
    if (!framework) throw new Error('Chain-of-Thought framework not found');
    return framework;
  }

  if (prompt.tags?.includes('template') || prompt.tags?.includes('documentation')) {
    const framework = PROMPT_FRAMEWORKS.find(f => f.name === 'Few-Shot');
    if (!framework) throw new Error('Few-Shot framework not found');
    return framework;
  }

  if (difficulty === 'beginner') {
    const framework = PROMPT_FRAMEWORKS.find(f => f.name === 'CRAFT');
    if (!framework) throw new Error('CRAFT framework not found');
    return framework;
  }

  // Default to CRAFT for simplicity
  const framework = PROMPT_FRAMEWORKS.find(f => f.name === 'CRAFT');
  if (!framework) throw new Error('CRAFT framework not found');
  return framework;
}

// ============================================================================
// STEP 4: MODEL RECOMMENDATION
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function determineBestModel(prompt: any): ModelRecommendation {
  const { difficulty, category, estimatedUsefulness } = prompt;

  // High-stakes, complex problems → expensive models
  if (difficulty === 'expert' || category === 'security' || estimatedUsefulness >= 9) {
    const model = MODEL_RECOMMENDATIONS.find(m => m.model === 'gpt-4o');
    if (!model) throw new Error('gpt-4o model not found');
    return model;
  }

  // Architecture, system design → reasoning models
  if (category === 'architecture' || prompt.tags?.includes('system-design')) {
    const model = MODEL_RECOMMENDATIONS.find(m => m.model === 'gpt-4o');
    if (!model) throw new Error('gpt-4o model not found');
    return model;
  }

  // Simple tasks → cheap models
  if (difficulty === 'beginner' || category === 'documentation') {
    const model = MODEL_RECOMMENDATIONS.find(m => m.model === 'gpt-4o-mini');
    if (!model) throw new Error('gpt-4o-mini model not found');
    return model;
  }

  // Coding tasks → Claude or GPT-4o
  if (category === 'engineering' || category === 'code-generation') {
    const model = MODEL_RECOMMENDATIONS.find(m => m.model === 'gpt-4o');
    if (!model) throw new Error('gpt-4o model not found');
    return model;
  }

  // Default: balanced model
  const model = MODEL_RECOMMENDATIONS.find(m => m.model === 'gpt-4o');
  if (!model) throw new Error('gpt-4o model not found');
  return model;
}

// ============================================================================
// STEP 5: RED-HAT REVIEW & SCORING
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function redHatReview(prompt: any, provider: AIProvider): Promise<RedHatScore> {
  const reviewPrompt = `You are a critical reviewer (red-hat thinker) evaluating a prompt for an engineering library.

PROMPT TO REVIEW:
Title: ${prompt.title}
Category: ${prompt.category}
Role: ${prompt.role}
Difficulty: ${prompt.difficulty}
Content: ${prompt.content}

SCORE THIS PROMPT (1-10 for each):

1. SKILL LEVEL: How specialized is the knowledge required?
   - 1-3: Any engineer can use this
   - 4-7: Requires some experience
   - 8-10: Expert-level only

2. ROLE SPECIFICITY: How tied is this to a specific role?
   - 1-3: General use across roles
   - 4-7: Somewhat role-specific
   - 8-10: Very role-specific (e.g., only for EMs, only for DevOps)

3. USEFULNESS: Would AI significantly help vs doing manually?
   - 1-3: Easy to do without AI, minimal time saved
   - 4-7: Moderate help, some complexity
   - 8-10: AI essential, significant time/quality improvement

4. OPTIMIZATION: Is the prompt well-structured and effective?
   - 1-3: Vague, poorly structured, missing context
   - 4-7: Decent but could improve
   - 8-10: Excellent structure, clear instructions, great examples

Provide brief reasoning (2-3 sentences) for your scores.

Return ONLY valid JSON:
{
  "skillLevel": 5,
  "roleSpecificity": 7,
  "usefulness": 8,
  "optimization": 6,
  "reasoning": "This prompt..."
}`;

  try {
    const response = await provider.execute({
      prompt: reviewPrompt,
      systemPrompt: 'You are a critical prompt reviewer. Return ONLY valid JSON, no markdown formatting, no code blocks.',
      temperature: 0.3, // Lower temperature for consistent scoring
      maxTokens: 500,
    });

    const scores = JSON.parse(response.content || '{}');
    
    return {
      ...scores,
      overall: (scores.skillLevel + scores.roleSpecificity + scores.usefulness + scores.optimization) / 4,
    };
  } catch (error) {
    // Fallback scores if AI review fails
    return {
      skillLevel: 5,
      roleSpecificity: 5,
      usefulness: 5,
      optimization: 5,
      overall: 5,
      reasoning: 'Error during red-hat review, using default scores',
    };
  }
}

// ============================================================================
// STEP 6: SAVE TO DATABASE
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function saveNewPromptsToDatabase(prompts: GeneratedPrompt[], db: any, dryRun: boolean) {
  if (dryRun) {
    console.log('\n🔬 DRY RUN - Prompts NOT saved to database\n');
    return;
  }

  console.log(`\n💾 SAVING ${prompts.length} NEW PROMPTS TO DATABASE\n`);
  
  // Generate slugs helper
  function generateSlug(title: string, id: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100) + `-${id}`;
  }
  
  const promptsToSave = prompts.map(p => {
    const id = `generated-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return {
      id,
      slug: generateSlug(p.title, id),
      title: p.title,
      description: p.description,
      content: p.content,
      category: p.category,
      role: p.role,
      pattern: p.pattern,
      tags: p.tags,
      difficulty: p.difficulty,
      isFeatured: p.redHatScore.overall >= 8,
      isPublic: true,
      views: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        recommendedFramework: p.framework.name,
        frameworkReasoning: p.framework.description,
        recommendedModel: p.recommendedModel.model,
        modelReasoning: p.recommendedModel.reasoning,
        estimatedCostPerUse: p.recommendedModel.costPerCall,
        redHatScores: p.redHatScore,
        generatedBy: 'ai-expansion-system',
        generatedAt: new Date(),
      },
    };
  });

  // Script context: Direct DB access needed for content migration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.collection('prompts').insertMany(promptsToSave);
  
  console.log(`✅ Saved ${promptsToSave.length} prompts to MongoDB`);
  const featuredCount = promptsToSave.filter(p => p.isFeatured).length;
  console.log(`   ${featuredCount} marked as featured (score >= 8)`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const analyzeOnly = args.includes('--analyze');
  const generateArg = args.find(a => a.startsWith('--generate='));
  const generateCount = generateArg
    ? parseInt(generateArg.split('=')[1] || '20')
    : 20;
  const fullRun = args.includes('--full');

  console.log('\n🚀 INTELLIGENT PROMPT LIBRARY EXPANSION\n');
  console.log('=' .repeat(70));
  console.log(`Mode: ${dryRun ? '🔬 DRY RUN' : fullRun ? '🚀 FULL RUN' : analyzeOnly ? '📊 ANALYZE ONLY' : '🤖 GENERATE'}`);
  console.log(`Generate: ${generateCount} new prompts`);
  console.log('=' .repeat(70));

  // Connect to MongoDB
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db('engify');

  // Step 1: Analyze existing prompts
  // Script context: Direct DB access needed for content migration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingPrompts = await db.collection('prompts').find({}).toArray();
  const analysis = await analyzeExistingPrompts(db);

  if (analyzeOnly) {
    console.log('\n✅ Analysis complete. Run without --analyze to generate prompts.\n');
    await client.close();
    process.exit(0);
  }

  // Step 2: Generate new prompts
  const newPrompts = await generateNewPrompts(analysis, generateCount, existingPrompts);

  // Step 3: Display summary
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 GENERATION SUMMARY\n');
  console.log(`Total prompts generated: ${newPrompts.length}`);
  console.log(`Average red-hat score: ${(newPrompts.reduce((sum, p) => sum + p.redHatScore.overall, 0) / newPrompts.length).toFixed(1)}/10`);
  console.log(`High-quality prompts (8+): ${newPrompts.filter(p => p.redHatScore.overall >= 8).length}`);
  console.log(`New roles added: ${[...new Set(newPrompts.map(p => p.role))].length}`);

  // Display top prompts
  const topPrompts = newPrompts
    .sort((a, b) => b.redHatScore.overall - a.redHatScore.overall)
    .slice(0, 5);

  console.log('\n🏆 TOP 5 PROMPTS BY RED-HAT SCORE:\n');
  topPrompts.forEach((p, i) => {
    console.log(`${i + 1}. ${p.title} (${p.redHatScore.overall.toFixed(1)}/10)`);
    console.log(`   ${p.description}`);
    console.log(`   Framework: ${p.framework.name} | Model: ${p.recommendedModel.model}`);
    console.log(`   Scores: Skill ${p.redHatScore.skillLevel}/10 | Role ${p.redHatScore.roleSpecificity}/10 | Useful ${p.redHatScore.usefulness}/10 | Optimized ${p.redHatScore.optimization}/10`);
    console.log();
  });

  // Step 4: Save to database
  await saveNewPromptsToDatabase(newPrompts, db, dryRun);

  await client.close();

  console.log('\n✅ EXPANSION COMPLETE!\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});

