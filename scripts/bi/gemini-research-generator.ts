#!/usr/bin/env tsx
/**
 * Gemini BI Research Generator
 * 
 * A reusable framework for generating AI-powered research reports using Gemini.
 * Connects to MongoDB, analyzes data, and generates comprehensive research insights.
 * 
 * Usage:
 *   tsx scripts/bi/gemini-research-generator.ts --type=prompt-suggestions
 *   tsx scripts/bi/gemini-research-generator.ts --type=content-gaps --category=patterns
 *   tsx scripts/bi/gemini-research-generator.ts --type=user-needs --role=engineering-manager
 * 
 * Research Types:
 *   - prompt-suggestions: Analyze gaps in prompt library (default)
 *   - content-gaps: Analyze gaps in content (patterns, learning resources)
 *   - user-needs: Analyze user needs by role/category
 *   - competitive-analysis: Compare with industry standards
 *   - trend-analysis: Identify emerging trends
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { patternRepository, promptRepository } from '@/lib/db/repositories/ContentService';
import { GeminiAdapter } from '@/lib/ai/v2/adapters/GeminiAdapter';
import { getModelsByProvider } from '@/lib/services/AIModelRegistry';
import fs from 'fs';
import path from 'path';

/**
 * Research Type Configuration
 */
interface ResearchTypeConfig {
  name: string;
  description: string;
  dataCollector: () => Promise<unknown>;
  promptBuilder: (data: unknown) => string;
  outputFormatter: (response: string) => unknown;
}

/**
 * Research Result Metadata
 */
interface ResearchMetadata {
  timestamp: string;
  researchType: string;
  model: string;
  modelContextWindow?: number;
  cost?: {
    input: number;
    output: number;
    total: number;
  };
  latency?: number;
  version: string;
}

/**
 * Research Result
 */
interface ResearchResult {
  metadata: ResearchMetadata;
  data: unknown;
  rawResponse?: string;
}

/**
 * Prompt Suggestions Research Type
 */
async function collectPromptSuggestionsData() {
  console.log('📊 Collecting prompt suggestions data...\n');

  const [patterns, prompts] = await Promise.all([
    patternRepository.getAll(),
    promptRepository.getAll(),
  ]);

  console.log(`✅ Found ${patterns.length} patterns`);
  console.log(`✅ Found ${prompts.length} prompts\n`);

  const categories = new Set(patterns.map((p) => p.category));
  const levels = new Set(patterns.map((p) => p.level));
  const roles = new Set(prompts.map((p) => p.role).filter(Boolean));
  const promptCategories = new Set(prompts.map((p) => p.category));
  const usedPatterns = new Set(prompts.map((p) => p.pattern).filter(Boolean));
  const samplePrompts = prompts.slice(0, 30);

  return {
    patterns,
    prompts,
    samplePrompts,
    categories: Array.from(categories),
    levels: Array.from(levels),
    roles: Array.from(roles),
    promptCategories: Array.from(promptCategories),
    usedPatterns: Array.from(usedPatterns),
  };
}

function buildPromptSuggestionsPrompt(data: unknown): string {
  const analysis = data as Awaited<ReturnType<typeof collectPromptSuggestionsData>>;
  const { patterns, samplePrompts, categories, levels, roles, promptCategories, usedPatterns } = analysis;

  // Build comprehensive "what we have" section
  const existingPatternsList = patterns.map((p) => 
    `- **${p.name}** (ID: \`${p.id}\`, Category: ${p.category}, Level: ${p.level})`
  ).join('\n');

  const existingCategoryList = Array.from(promptCategories).sort().map(c => `- \`${c}\``).join('\n');
  const existingRoleList = Array.from(roles).sort().map(r => `- \`${r}\``).join('\n');
  const existingUsedPatternsList = Array.from(usedPatterns).sort().map(p => `- \`${p}\``).join('\n');

  return `You are an expert prompt engineering consultant analyzing Engify.ai, an AI training platform for engineering teams.

## CRITICAL: What We ALREADY Have

**DO NOT suggest duplicates of what we already have. Review this section carefully before making suggestions.**

### Existing Patterns (${patterns.length} total):
${existingPatternsList}

### Existing Prompt Categories (${promptCategories.size} total):
${existingCategoryList}

### Existing Roles (${roles.size} total):
${existingRoleList}

### Patterns Already Used in Our Prompts:
${existingUsedPatternsList.length > 0 ? existingUsedPatternsList : 'None yet'}

### Sample Prompts (${samplePrompts.length} of ${analysis.prompts.length} total):
${samplePrompts.slice(0, 10).map((p, i) => `${i + 1}. **${p.title}**
   - Category: \`${p.category}\`
   - Role: ${p.role ? `\`${p.role}\`` : 'None'}
   - Pattern: ${p.pattern ? `\`${p.pattern}\`` : 'None'}
   - Description: ${p.description.substring(0, 80)}...`).join('\n')}

## Site Context

**Mission:** Help developers, engineers, and product managers use AI better through prompt engineering patterns and ready-to-use prompts.

**Pattern Categories Available:** ${categories.join(', ')}
**Pattern Levels Available:** ${levels.join(', ')}

## Your Task

**IMPORTANT:** Before suggesting anything, verify it doesn't already exist in the lists above. Focus ONLY on genuine gaps.

Analyze the gaps and opportunities in this prompt engineering library. Provide:

### 1. Suggested New Patterns (5-10)
**CRITICAL:** Do NOT suggest patterns we already have. Check the "Existing Patterns" list above first.

Research proven prompt engineering patterns from:
- OpenAI's prompt engineering guide
- Anthropic's prompt engineering research
- Academic papers on prompt engineering
- Industry best practices

For each suggested pattern, provide:
- Name (clear, descriptive - must be different from existing patterns)
- ID (kebab-case, unique - check against existing IDs)
- Category (FOUNDATIONAL, STRUCTURAL, COGNITIVE, or ITERATIVE)
- Level (beginner, intermediate, or advanced)
- Description (1-2 sentences)
- Reason (why this fills a gap - explain what's missing that this addresses)

**Focus ONLY on:**
- Patterns we DON'T have yet (verify against existing list)
- Patterns that address different problem types than existing ones
- Patterns for skill levels we're missing
- Industry-standard patterns we're genuinely missing

**DO NOT suggest:**
- Chain-of-Thought (we have it)
- Any pattern already in our existing list
- Variations of existing patterns unless they solve distinctly different problems

### 2. Suggested New Prompts (10-20)
**CRITICAL:** Check existing categories and roles before suggesting. Only suggest new categories/roles if absolutely necessary.

Identify gaps in our prompt library and suggest prompts that:
- Cover missing categories (verify against existing categories list)
- Target missing roles (check existing roles list - we may already have DevOps, QA, etc.)
- Use patterns we have but aren't utilizing effectively
- Address common engineering tasks we're not covering
- Fill gaps in experience levels (beginner vs advanced)

For each suggested prompt, provide:
- Title (clear, action-oriented)
- Description (what it does, why it's useful)
- Category (prefer existing categories - only suggest new if truly necessary)
- Role (prefer existing roles - only suggest new if we're missing that role entirely)
- Pattern (which pattern it uses - can be null if none)
- Level (beginner, intermediate, or advanced)
- Reason (why this fills a gap - be specific about what's missing)

### 3. Missing Roles
**CRITICAL:** Check the "Existing Roles" list above first. Only list roles we DON'T have.

List engineering roles we should target but don't have prompts for yet. 
**DO NOT list:** ${Array.from(roles).sort().join(', ')} (we already have these)

Focus on roles like: DevOps Engineer, QA Engineer, Data Scientist, Site Reliability Engineer, Security Engineer, etc. - but ONLY if they're not in our existing roles list.

### 4. Missing Categories
**CRITICAL:** Check the "Existing Prompt Categories" list above first. Only list categories we DON'T have.

List prompt categories we should add but don't have yet.
**DO NOT list:** ${Array.from(promptCategories).join(', ')} (we already have these)

Only suggest genuinely new categories that would serve different use cases than existing ones.

### 5. Level Distribution Analysis
For each category, identify if we're missing beginner, intermediate, or advanced prompts/patterns.

### 6. Research Insights
Share 2-3 insights from current prompt engineering research that could inform new patterns or prompts:
- Emerging techniques
- Best practices we're not covering
- Industry needs we're missing

## Output Format

Provide your analysis as a JSON object with this structure:
{
  "suggestedPatterns": [
    {
      "name": "Pattern Name",
      "id": "pattern-id",
      "category": "COGNITIVE",
      "level": "intermediate",
      "description": "Brief description",
      "reason": "Why this fills a gap"
    }
  ],
  "suggestedPrompts": [
    {
      "title": "Prompt Title",
      "description": "What it does",
      "category": "development",
      "role": "devops-engineer",
      "pattern": "pattern-id",
      "level": "intermediate",
      "reason": "Why this fills a gap"
    }
  ],
  "missingRoles": ["devops-engineer", "qa-engineer", ...],
  "missingCategories": ["testing", "documentation", ...],
  "missingLevels": {
    "development": { "beginner": 5, "intermediate": 3, "advanced": 2 },
    ...
  },
  "researchInsights": [
    "Insight 1 about prompt engineering",
    "Insight 2 about gaps",
    ...
  ]
}

Be thorough and creative. Think about what engineering teams actually need to use AI effectively.`;
}

function formatPromptSuggestionsResponse(response: string): unknown {
  // Try to extract JSON from markdown code blocks if present
  let jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch) {
    jsonMatch = response.match(/```\s*([\s\S]*?)\s*```/);
  }
  
  const jsonContent = jsonMatch ? jsonMatch[1] : response.trim();
  
  try {
    return JSON.parse(jsonContent);
  } catch (error) {
    console.warn('⚠️  Failed to parse JSON response, returning raw response');
    return { rawResponse: response, parseError: String(error) };
  }
}

/**
 * Research Type Registry
 */
const RESEARCH_TYPES: Record<string, ResearchTypeConfig> = {
  'prompt-suggestions': {
    name: 'Prompt & Pattern Suggestions',
    description: 'Analyze gaps in prompt library and suggest new prompts and patterns',
    dataCollector: collectPromptSuggestionsData,
    promptBuilder: buildPromptSuggestionsPrompt,
    outputFormatter: formatPromptSuggestionsResponse,
  },
  // TODO: Add more research types:
  // 'content-gaps': { ... },
  // 'user-needs': { ... },
  // 'competitive-analysis': { ... },
};

/**
 * Get Gemini model from registry
 */
async function getGeminiModel() {
  const geminiModels = await getModelsByProvider('google');
  
  const activeModels = geminiModels.filter(m => 
    m.status !== 'deprecated' && 
    m.status !== 'sunset' && 
    !m.deprecated &&
    m.isAllowed !== false
  );

  if (activeModels.length === 0) {
    throw new Error('No valid Gemini models found in registry. Please sync models first.');
  }

  // Prefer models with "flash" or "exp" in name (free tier), fallback to first available
  const preferredModel = activeModels.find(m => 
    m.id.includes('flash') || m.id.includes('exp')
  ) || activeModels[0];

  return {
    modelId: preferredModel.id,
    model: preferredModel,
  };
}

/**
 * Generate research report
 */
async function generateResearch(
  researchType: string,
  options: Record<string, string> = {}
): Promise<ResearchResult> {
  const config = RESEARCH_TYPES[researchType];
  
  if (!config) {
    throw new Error(`Unknown research type: ${researchType}. Available types: ${Object.keys(RESEARCH_TYPES).join(', ')}`);
  }

  console.log(`🚀 Starting ${config.name} Research\n`);
  console.log(`📋 Description: ${config.description}\n`);

  // Collect data
  console.log('📊 Collecting data...\n');
  const data = await config.dataCollector();

  // Build prompt
  console.log('📝 Building research prompt...\n');
  const prompt = config.promptBuilder(data);

  // Get Gemini model
  console.log('🔮 Finding valid Gemini model from registry...\n');
  const { modelId, model } = await getGeminiModel();
  
  console.log(`✅ Using model: ${model.name || modelId}`);
  if (model.contextWindow) {
    console.log(`   Context window: ${model.contextWindow.toLocaleString()} tokens`);
  }
  console.log(`   Status: ${model.status || 'active'}\n`);

  // Initialize adapter
  const gemini = new GeminiAdapter(modelId);

  // Generate research with retry logic
  console.log('💭 Generating research (this may take a minute)...\n');
  console.log('⚠️  Note: If you hit rate limits, wait a few minutes and try again.\n');
  
  let response;
  let retries = 3;
  let delay = 5000;
  
  while (retries > 0) {
    try {
      const aiResponse = await gemini.execute({
        prompt: prompt,
        systemPrompt: 'You are an expert consultant with deep knowledge of AI, engineering workflows, and best practices.',
        temperature: 0.7,
        maxTokens: 8000,
      });
      
      response = aiResponse;
      break;
    } catch (error) {
      retries--;
      if (retries === 0) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        console.log(`⏳ Rate limit hit. Waiting ${delay / 1000} seconds before retry... (${retries} retries left)\n`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }

  // Format response
  const formattedData = config.outputFormatter(response.content);

  // Build metadata
  const metadata: ResearchMetadata = {
    timestamp: new Date().toISOString(),
    researchType,
    model: modelId,
    modelContextWindow: model.contextWindow,
    cost: response.cost,
    latency: response.latency,
    version: '1.0.0',
  };

  return {
    metadata,
    data: formattedData,
    rawResponse: response.content,
  };
}

/**
 * Save research result
 */
function saveResearchResult(result: ResearchResult, researchType: string): string {
  const outputDir = path.join(process.cwd(), 'docs/bi/research');
  
  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = `${researchType}-${timestamp}.json`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(result, null, 2), 'utf-8');
  
  return filepath;
}

/**
 * Display research results
 */
function displayResults(result: ResearchResult, researchType: string) {
  console.log('\n✨ RESEARCH COMPLETE\n');
  console.log('='.repeat(80));
  console.log(`\n📋 Research Type: ${researchType}`);
  console.log(`📅 Timestamp: ${result.metadata.timestamp}`);
  console.log(`🤖 Model: ${result.metadata.model}`);
  if (result.metadata.cost) {
    console.log(`💰 Cost: $${result.metadata.cost.total.toFixed(4)}`);
  }
  if (result.metadata.latency) {
    console.log(`⏱️  Latency: ${(result.metadata.latency / 1000).toFixed(2)}s`);
  }
  console.log('='.repeat(80));

  // Type-specific display logic
  if (researchType === 'prompt-suggestions') {
    const data = result.data as any;
    
    if (data.suggestedPatterns) {
      console.log('\n📋 SUGGESTED PATTERNS:\n');
      data.suggestedPatterns.forEach((pattern: any, i: number) => {
        console.log(`${i + 1}. ${pattern.name} (${pattern.category}, ${pattern.level})`);
        console.log(`   ID: ${pattern.id}`);
        console.log(`   Description: ${pattern.description}`);
        console.log(`   Reason: ${pattern.reason}\n`);
      });
    }

    if (data.suggestedPrompts) {
      console.log('\n📝 SUGGESTED PROMPTS:\n');
      data.suggestedPrompts.forEach((prompt: any, i: number) => {
        console.log(`${i + 1}. ${prompt.title}`);
        console.log(`   Category: ${prompt.category} | Role: ${prompt.role || 'Any'} | Level: ${prompt.level}`);
        console.log(`   Pattern: ${prompt.pattern || 'None'}`);
        console.log(`   Description: ${prompt.description}`);
        console.log(`   Reason: ${prompt.reason}\n`);
      });
    }

    if (data.missingRoles) {
      console.log('\n👥 MISSING ROLES:\n');
      data.missingRoles.forEach((role: string) => {
        console.log(`- ${role}`);
      });
    }

    if (data.missingCategories) {
      console.log('\n📂 MISSING CATEGORIES:\n');
      data.missingCategories.forEach((category: string) => {
        console.log(`- ${category}`);
      });
    }
  }

  console.log('\n' + '='.repeat(80));
}

/**
 * Main function
 */
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const options: Record<string, string> = {};
    
    args.forEach(arg => {
      if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        options[key] = value || '';
      }
    });

    const researchType = options.type || 'prompt-suggestions';

    // Generate research
    const result = await generateResearch(researchType, options);

    // Display results
    displayResults(result, researchType);

    // Save to file
    const filepath = saveResearchResult(result, researchType);
    console.log(`\n💾 Saved full research to: ${filepath}\n`);

    console.log('✅ Research complete! Review the results above and in the JSON file.\n');

  } catch (error) {
    console.error('❌ Error generating research:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { generateResearch, RESEARCH_TYPES, type ResearchResult, type ResearchTypeConfig };

