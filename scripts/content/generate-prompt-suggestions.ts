#!/usr/bin/env tsx
/**
 * Generate Prompt & Pattern Suggestions
 * 
 * Connects to MongoDB, analyzes existing patterns and prompts,
 * then uses Gemini to suggest new prompts and patterns based on gaps.
 * 
 * Usage:
 *   tsx scripts/content/generate-prompt-suggestions.ts
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { patternRepository, promptRepository } from '@/lib/db/repositories/ContentService';
import { GeminiAdapter } from '@/lib/ai/v2/adapters/GeminiAdapter';
import { getModelsByProvider } from '@/lib/services/AIModelRegistry';

interface AnalysisResult {
  suggestedPatterns: Array<{
    name: string;
    id: string;
    category: string;
    level: string;
    description: string;
    reason: string;
  }>;
  suggestedPrompts: Array<{
    title: string;
    description: string;
    category: string;
    role?: string;
    pattern?: string;
    level: string;
    reason: string;
  }>;
  missingRoles: string[];
  missingCategories: string[];
  missingLevels: Record<string, number>; // category -> count
  researchInsights: string[];
}

async function analyzeCurrentContent() {
  console.log('📊 Analyzing current content...\n');

  // Fetch all patterns and prompts
  const [patterns, prompts] = await Promise.all([
    patternRepository.getAll(),
    promptRepository.getAll(),
  ]);

  console.log(`✅ Found ${patterns.length} patterns`);
  console.log(`✅ Found ${prompts.length} prompts\n`);

  // Analyze what we have
  const categories = new Set(patterns.map((p) => p.category));
  const levels = new Set(patterns.map((p) => p.level));
  const roles = new Set(prompts.map((p) => p.role).filter(Boolean));
  const promptCategories = new Set(prompts.map((p) => p.category));
  const usedPatterns = new Set(prompts.map((p) => p.pattern).filter(Boolean));

  // Sample prompts (limit to ~30 for context)
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

function buildGeminiPrompt(analysis: Awaited<ReturnType<typeof analyzeCurrentContent>>): string {
  const { patterns, samplePrompts, categories, levels, roles, promptCategories, usedPatterns } = analysis;

  return `You are an expert prompt engineering consultant analyzing Engify.ai, an AI training platform for engineering teams.

## Current Site Context

**Mission:** Help developers, engineers, and product managers use AI better through prompt engineering patterns and ready-to-use prompts.

**Current Patterns (${patterns.length}):**
${patterns.map((p, i) => `${i + 1}. **${p.name}** (${p.category}, ${p.level})
   - ID: ${p.id}
   - Description: ${p.description}
   ${p.useCases ? `- Use Cases: ${p.useCases.slice(0, 3).join(', ')}` : ''}`).join('\n')}

**Pattern Categories:** ${categories.join(', ')}
**Pattern Levels:** ${levels.join(', ')}

**Current Prompts Sample (${samplePrompts.length} of ${analysis.prompts.length} total):**
${samplePrompts.map((p, i) => `${i + 1}. **${p.title}**
   - Category: ${p.category}
   ${p.role ? `- Role: ${p.role}` : ''}
   ${p.pattern ? `- Pattern: ${p.pattern}` : ''}
   - Description: ${p.description.substring(0, 100)}...`).join('\n')}

**Current Prompt Categories:** ${promptCategories.join(', ')}
**Current Roles:** ${roles.length > 0 ? roles.join(', ') : 'None yet'}
**Patterns Used in Prompts:** ${usedPatterns.length > 0 ? usedPatterns.join(', ') : 'None yet'}

## Your Task

Analyze the gaps and opportunities in this prompt engineering library. Provide:

### 1. Suggested New Patterns (5-10)
Research proven prompt engineering patterns from:
- OpenAI's prompt engineering guide
- Anthropic's prompt engineering research
- Academic papers on prompt engineering
- Industry best practices

For each suggested pattern, provide:
- Name (clear, descriptive)
- ID (kebab-case, unique)
- Category (FOUNDATIONAL, STRUCTURAL, COGNITIVE, or ITERATIVE)
- Level (beginner, intermediate, or advanced)
- Description (1-2 sentences)
- Reason (why this fills a gap)

Focus on:
- Patterns we don't have yet
- Patterns that address different problem types
- Patterns for different skill levels
- Industry-standard patterns we're missing

### 2. Suggested New Prompts (10-20)
Identify gaps in our prompt library and suggest prompts that:
- Cover missing categories
- Target missing roles (e.g., DevOps, QA, Data Scientist, etc.)
- Use patterns we have but aren't utilizing
- Address common engineering tasks we're not covering
- Fill gaps in experience levels (beginner vs advanced)

For each suggested prompt, provide:
- Title (clear, action-oriented)
- Description (what it does, why it's useful)
- Category (from existing or suggest new)
- Role (target user role - suggest if missing)
- Pattern (which pattern it uses - can be null if none)
- Level (beginner, intermediate, or advanced)
- Reason (why this fills a gap)

### 3. Missing Roles
List engineering roles we should target but don't have prompts for yet (e.g., DevOps Engineer, QA Engineer, Data Scientist, Site Reliability Engineer, etc.)

### 4. Missing Categories
List prompt categories we should add but don't have yet (e.g., Testing, Documentation, Code Review, DevOps, Data Analysis, etc.)

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

async function generateSuggestions() {
  try {
    console.log('🚀 Starting Prompt & Pattern Analysis\n');

    // Analyze current content
    const analysis = await analyzeCurrentContent();

    // Build comprehensive prompt
    console.log('📝 Building analysis prompt for Gemini...\n');
    const geminiPrompt = buildGeminiPrompt(analysis);

    // Get valid Gemini model from database registry
    console.log('🔮 Finding valid Gemini model from registry...\n');
    const geminiModels = await getModelsByProvider('google');
    
    // Filter for active, non-deprecated models
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

    const modelId = preferredModel.id;
    console.log(`✅ Using model: ${preferredModel.name || modelId}`);
    if (preferredModel.contextWindow) {
      console.log(`   Context window: ${preferredModel.contextWindow.toLocaleString()} tokens`);
    }
    console.log(`   Status: ${preferredModel.status || 'active'}\n`);

    // Initialize Gemini adapter with model from registry
    const gemini = new GeminiAdapter(modelId);

    // Generate suggestions with retry logic for rate limits
    console.log('💭 Generating suggestions (this may take a minute)...\n');
    console.log('⚠️  Note: If you hit rate limits, wait a few minutes and try again.\n');
    console.log(`📊 Model info: ${preferredModel.name || modelId}`);
    if (preferredModel.contextWindow) {
      console.log(`   Context window: ${preferredModel.contextWindow.toLocaleString()} tokens\n`);
    }
    
    let response;
    let retries = 3;
    let delay = 5000; // Start with 5 second delay
    
    while (retries > 0) {
      try {
        response = await gemini.execute({
          prompt: geminiPrompt,
          systemPrompt: 'You are an expert prompt engineering consultant with deep knowledge of AI model capabilities, engineering workflows, and best practices for prompt design.',
          temperature: 0.7,
          maxTokens: 8000,
        });
        break; // Success, exit retry loop
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw error; // Re-throw if all retries exhausted
        }
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
          console.log(`⏳ Rate limit hit. Waiting ${delay / 1000} seconds before retry... (${retries} retries left)\n`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        } else {
          throw error; // Re-throw non-rate-limit errors
        }
      }
    }

    // Parse JSON response
    const content = response.content.trim();
    
    // Try to extract JSON from markdown code blocks if present
    let jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      jsonMatch = content.match(/```\s*([\s\S]*?)\s*```/);
    }
    
    const jsonContent = jsonMatch ? jsonMatch[1] : content;
    
    let suggestions: AnalysisResult;
    try {
      suggestions = JSON.parse(jsonContent);
    } catch (error) {
      // If JSON parsing fails, save raw response for manual review
      console.error('❌ Failed to parse JSON response');
      console.log('Raw response:', content);
      return;
    }

    // Display results
    console.log('\n✨ ANALYSIS COMPLETE\n');
    console.log('=' .repeat(80));
    console.log('\n📋 SUGGESTED PATTERNS:\n');
    suggestions.suggestedPatterns.forEach((pattern, i) => {
      console.log(`${i + 1}. ${pattern.name} (${pattern.category}, ${pattern.level})`);
      console.log(`   ID: ${pattern.id}`);
      console.log(`   Description: ${pattern.description}`);
      console.log(`   Reason: ${pattern.reason}\n`);
    });

    console.log('\n📝 SUGGESTED PROMPTS:\n');
    suggestions.suggestedPrompts.forEach((prompt, i) => {
      console.log(`${i + 1}. ${prompt.title}`);
      console.log(`   Category: ${prompt.category} | Role: ${prompt.role || 'Any'} | Level: ${prompt.level}`);
      console.log(`   Pattern: ${prompt.pattern || 'None'}`);
      console.log(`   Description: ${prompt.description}`);
      console.log(`   Reason: ${prompt.reason}\n`);
    });

    console.log('\n👥 MISSING ROLES:\n');
    suggestions.missingRoles.forEach((role) => {
      console.log(`- ${role}`);
    });

    console.log('\n📂 MISSING CATEGORIES:\n');
    suggestions.missingCategories.forEach((category) => {
      console.log(`- ${category}`);
    });

    console.log('\n📊 LEVEL DISTRIBUTION GAPS:\n');
    Object.entries(suggestions.missingLevels).forEach(([category, counts]) => {
      console.log(`${category}:`);
      console.log(`  Beginner: ${counts.beginner || 0}`);
      console.log(`  Intermediate: ${counts.intermediate || 0}`);
      console.log(`  Advanced: ${counts.advanced || 0}`);
    });

    console.log('\n🔬 RESEARCH INSIGHTS:\n');
    suggestions.researchInsights.forEach((insight, i) => {
      console.log(`${i + 1}. ${insight}`);
    });

    // Save to file
    const fs = await import('fs');
    const path = await import('path');
    const outputPath = path.join(process.cwd(), 'docs/content/SUGGESTED_PROMPTS_AND_PATTERNS.json');
    
    fs.writeFileSync(
      outputPath,
      JSON.stringify(suggestions, null, 2),
      'utf-8'
    );
    
    console.log(`\n💾 Saved full analysis to: ${outputPath}\n`);

    console.log('=' .repeat(80));
    console.log('\n✅ Analysis complete! Review the suggestions above and in the JSON file.\n');

  } catch (error) {
    console.error('❌ Error generating suggestions:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the analysis
generateSuggestions();

