#!/usr/bin/env tsx
/**
 * Show Gemini Research Prompt
 * Generates and displays the prompt for manual pasting into Gemini
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { patternRepository, promptRepository } from '@/lib/db/repositories/ContentService';
import fs from 'fs';
import path from 'path';

async function main() {
  try {
    console.log('📊 Collecting data from MongoDB...\n');

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

    // Build comprehensive "what we have" section
    const existingPatternsList = patterns.map((p) => 
      `- **${p.name}** (ID: \`${p.id}\`, Category: ${p.category}, Level: ${p.level})`
    ).join('\n');

    const existingCategoryList = Array.from(promptCategories).sort().map(c => `- \`${c}\``).join('\n');
    const existingRoleList = Array.from(roles).filter(Boolean).sort().map(r => `- \`${r}\``).join('\n');
    const existingUsedPatternsList = Array.from(usedPatterns).sort().map(p => `- \`${p}\``).join('\n');

    const prompt = `You are an expert prompt engineering consultant analyzing Engify.ai, an AI training platform for engineering teams.

## CRITICAL: What We ALREADY Have

**DO NOT suggest duplicates of what we already have. Review this section carefully before making suggestions.**

### Existing Patterns (${patterns.length} total):
${existingPatternsList}

### Existing Prompt Categories (${promptCategories.size} total):
${existingCategoryList}

### Existing Roles (${Array.from(roles).filter(Boolean).length} total):
${existingRoleList}

### Patterns Already Used in Our Prompts:
${existingUsedPatternsList.length > 0 ? existingUsedPatternsList : 'None yet'}

### Sample Prompts (${samplePrompts.length} of ${prompts.length} total):
${samplePrompts.slice(0, 10).map((p, i) => `${i + 1}. **${p.title}**
   - Category: \`${p.category}\`
   - Role: ${p.role ? `\`${p.role}\`` : 'None'}
   - Pattern: ${p.pattern ? `\`${p.pattern}\`` : 'None'}
   - Description: ${p.description.substring(0, 80)}...`).join('\n')}

## Site Context

**Mission:** Help developers, engineers, and product managers use AI better through prompt engineering patterns and ready-to-use prompts.

**Pattern Categories Available:** ${Array.from(categories).join(', ')}
**Pattern Levels Available:** ${Array.from(levels).join(', ')}

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
**DO NOT list:** ${Array.from(roles).filter(Boolean).sort().join(', ')} (we already have these)

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

Provide your analysis as a clear, actionable markdown document with bulleted lists. Use this structure:

### 1. Suggested New Patterns

For each suggested pattern, provide a bullet point with:
- **Pattern Name** (ID: pattern-id)
  - Category: COGNITIVE | STRUCTURAL | FOUNDATIONAL | ITERATIVE
  - Level: beginner | intermediate | advanced
  - Description: Brief description of what this pattern does
  - Reason: Why this fills a gap (explain what's missing that this addresses)

### 2. Suggested New Prompts

For each suggested prompt, provide a bullet point with:
- **Prompt Title**
  - Category: Existing category OR new category name
  - Role: Existing role OR new role name
  - Pattern: Pattern ID to use (or "None" if no pattern)
  - Level: beginner | intermediate | advanced
  - Description: What this prompt does and why it's useful
  - Reason: Why this fills a gap (be specific about what's missing)

### 3. Missing Roles

List engineering roles we DON'T have as bullet points:
- Role name 1
- Role name 2
- etc.

### 4. Missing Categories

List prompt categories we DON'T have as bullet points:
- Category name 1
- Category name 2
- etc.

### 5. Level Distribution Analysis

For each category, identify gaps:
- **Category Name**
  - Missing beginner prompts: X
  - Missing intermediate prompts: Y
  - Missing advanced prompts: Z

### 6. Research Insights

Provide 2-3 actionable insights as bullet points:
- Insight 1: What this means and how we can use it
- Insight 2: What this means and how we can use it
- Insight 3: What this means and how we can use it

**Important:** Use clear markdown formatting with headers, bullet points, and bold text for emphasis. Make it actionable and easy to scan. Do NOT use JSON format.`;

    // Save to file
    const outputDir = path.join(process.cwd(), 'docs/bi');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const filepath = path.join(outputDir, 'gemini-research-prompt.md');
    fs.writeFileSync(filepath, prompt, 'utf-8');

    console.log('\n' + '='.repeat(80));
    console.log('📋 GEMINI RESEARCH PROMPT');
    console.log('='.repeat(80));
    console.log(`\n✅ Prompt saved to: ${filepath}`);
    console.log('\n📋 Copy the prompt from the file above and paste it into Gemini Deep Research.\n');
    console.log('='.repeat(80) + '\n');
    console.log(prompt.substring(0, 500) + '...\n[Full prompt saved to file]');
    console.log('\n' + '='.repeat(80));
    console.log(`\n💡 Full prompt available at: ${filepath}\n`);

  } catch (error) {
    console.error('❌ Error generating prompt:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  }
}

main();

