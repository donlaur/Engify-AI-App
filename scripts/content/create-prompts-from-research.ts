/**
 * Create Prompts from Research Document
 *
 * This script checks if prompts exist for each problem in the research document,
 * and creates new prompts if they don't exist.
 *
 * Run with: pnpm tsx scripts/content/create-prompts-from-research.ts
 */

import { getMongoDb } from '@/lib/db/mongodb';
import { ROLE_CONTENT } from '@/lib/data/role-content';
import { generateSlug } from '@/lib/utils/slug';
import { randomUUID } from 'crypto';

// Map role content keys to database role values
const ROLE_MAPPING: Record<string, string> = {
  'engineering-manager': 'engineering-manager',
  'product-manager': 'product-manager',
  'product-owner': 'product-owner',
  engineer: 'engineer',
  'devops-sre': 'devops-sre',
  qa: 'qa',
  designer: 'designer',
};

// Map problem types to categories
function getCategoryFromProblem(title: string, _role: string): string {
  const titleLower = title.toLowerCase();

  if (
    titleLower.includes('performance review') ||
    titleLower.includes('pip') ||
    titleLower.includes('conversation')
  ) {
    return 'general'; // Management/leadership
  }
  if (
    titleLower.includes('test') ||
    titleLower.includes('bug') ||
    titleLower.includes('qa')
  ) {
    return 'testing';
  }
  if (
    titleLower.includes('code') ||
    titleLower.includes('debug') ||
    titleLower.includes('refactor')
  ) {
    return 'code-generation';
  }
  if (titleLower.includes('documentation') || titleLower.includes('document')) {
    return 'documentation';
  }
  if (
    titleLower.includes('architecture') ||
    titleLower.includes('design') ||
    titleLower.includes('system')
  ) {
    return 'architecture';
  }
  if (
    titleLower.includes('roadmap') ||
    titleLower.includes('stakeholder') ||
    titleLower.includes('user story')
  ) {
    return 'general';
  }

  return 'general';
}

// Extract pattern name from AI solution description
function extractPatternName(aiSolution: string): string {
  // Look for pattern names in quotes or after "The"
  const match =
    aiSolution.match(/"([^"]+)"/) || aiSolution.match(/The "([^"]+)"/);
  if (match && match.length > 1 && match[1] !== undefined) {
    return match[1].toLowerCase().replace(/\s+/g, '-');
  }

  // Fallback: extract first significant words
  const words = aiSolution.split(' ').slice(0, 3);
  return words
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
}

// Generate prompt content from solution steps
function generatePromptContent(
  problem: {
    title: string;
    description: string;
    aiSolution: string;
    solutionSteps?: string[];
    example?: string;
  },
  roleTitle: string
): string {
  const patternName = extractPatternName(problem.aiSolution);

  let content = `# ${problem.title}\n\n`;
  content += `## Problem Context\n`;
  content += `${problem.description}\n\n`;

  content += `## Solution Pattern: ${patternName}\n\n`;
  content += `${problem.aiSolution}\n\n`;

  if (problem.solutionSteps && problem.solutionSteps.length > 0) {
    content += `## Multi-Step Workflow\n\n`;
    content += `This is a multi-step process. Follow each step in order:\n\n`;

    problem.solutionSteps.forEach((step, idx) => {
      const stepNum = idx + 1;
      const stepParts = step.split(' - ');
      const stepTitle =
        stepParts.length > 0 && stepParts[0] ? stepParts[0] : step;
      content += `### Step ${stepNum}: ${stepTitle}\n\n`;

      // Extract step description if available
      const stepDesc = stepParts.length > 1 && stepParts[1] ? stepParts[1] : '';
      if (stepDesc) {
        content += `${stepDesc}\n\n`;
      }

      // Generate prompt template for each step
      content += `**Prompt Template:**\n\n`;

      if (
        step.includes('Data Ingestion') ||
        step.includes('Synthesize') ||
        step.includes('Analyze')
      ) {
        content += `Act as an ${roleTitle}'s assistant. I am ${problem.description.toLowerCase()}.\n\n`;
        content += `I will provide you with [relevant data/context]. Your task is to:\n`;
        if (stepDesc.includes('themes')) {
          content += `1. Analyze all inputs\n`;
          content += `2. Identify key themes, patterns, and insights\n`;
          content += `3. Provide a structured summary with specific examples\n\n`;
        } else {
          content += `1. Process and analyze the provided information\n`;
          content += `2. Extract key insights and patterns\n`;
          content += `3. Present findings in a clear, structured format\n\n`;
        }
      } else if (
        step.includes('Drafting') ||
        step.includes('Generate') ||
        step.includes('Create')
      ) {
        const prevStep =
          stepNum > 1 ? `Step ${stepNum - 1}` : 'the previous step';
        content += `Using the analysis from ${prevStep}, generate [specific output].\n\n`;
        content += `Requirements:\n`;
        content += `- Use the themes and insights identified in the previous step\n`;
        content += `- Include specific examples and behavioral evidence\n`;
        content += `- Ensure tone is professional and constructive\n`;
        content += `- Follow [company/team] competency models and guidelines\n\n`;
      } else if (step.includes('Refinement') || step.includes('Refine')) {
        const prevStep =
          stepNum > 1 ? `Step ${stepNum - 1}` : 'the previous step';
        content += `Review and refine the output from ${prevStep}.\n\n`;
        content += `Focus on:\n`;
        content += `- Improving clarity and specificity\n`;
        content += `- Balancing positive and constructive feedback\n`;
        content += `- Ensuring alignment with goals and objectives\n`;
        content += `- Adding actionable next steps or recommendations\n\n`;
      } else {
        content += `[Customize this step based on your specific needs]\n\n`;
        content += `Instructions:\n`;
        content += `- Follow the step description: ${step}\n`;
        content += `- Adapt the template to your context\n`;
        content += `- Provide clear, actionable output\n\n`;
      }

      content += `\n`;
    });
  } else {
    // Single-step prompt
    content += `## Prompt Template\n\n`;
    content += `Act as an ${roleTitle}. ${problem.description}\n\n`;
    content += `${problem.aiSolution}\n\n`;
    content += `**Instructions:**\n`;
    content += `1. Understand the problem context\n`;
    content += `2. Apply the solution pattern described above\n`;
    content += `3. Provide step-by-step guidance\n`;
    content += `4. Include specific examples and best practices\n\n`;
  }

  if (problem.example) {
    content += `## Example Use Case\n\n`;
    content += `${problem.example}\n\n`;
  }

  content += `---\n\n`;
  content += `*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*\n`;

  return content;
}

// Generate tags from title and role
function generateTags(title: string, role: string): string[] {
  const tags: string[] = [];
  const titleLower = title.toLowerCase();

  // Add role-based tags
  tags.push(role.replace('-', '-'));

  // Extract key terms from title
  const words = titleLower.split(/\s+/);
  words.forEach((word) => {
    if (
      word.length > 4 &&
      !['the', 'and', 'for', 'with', 'from'].includes(word)
    ) {
      tags.push(word);
    }
  });

  // Add problem-specific tags
  if (titleLower.includes('performance')) tags.push('performance-reviews');
  if (titleLower.includes('pip')) tags.push('pip', 'management');
  if (titleLower.includes('test')) tags.push('testing', 'qa');
  if (titleLower.includes('debug')) tags.push('debugging');
  if (titleLower.includes('documentation')) tags.push('docs');
  if (titleLower.includes('roadmap')) tags.push('roadmap', 'planning');
  if (titleLower.includes('stakeholder')) tags.push('stakeholder-management');

  // Remove duplicates and limit
  return [...new Set(tags)].slice(0, 8);
}

async function main() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    const db = await getMongoDb();
    const promptsCollection = db.collection('prompts');
    console.log('✅ Connected to MongoDB\n');

    // Get all existing prompts to check for duplicates
    const existingPrompts = await promptsCollection
      .find({}, { projection: { title: 1, slug: 1 } })
      .toArray();

    const existingTitles = new Set(
      existingPrompts.map((p) => p.title?.toLowerCase())
    );
    const existingSlugs = new Set(
      existingPrompts.map((p) => p.slug).filter(Boolean)
    );

    console.log(
      `📊 Found ${existingPrompts.length} existing prompts in database\n`
    );

    let created = 0;
    let skipped = 0;
    const promptsToCreate: Array<{
      id: string;
      slug: string;
      title: string;
      description: string;
      content: string;
      category: string;
      role: string;
      pattern?: string;
      tags: string[];
      currentRevision: number;
      views: number;
      rating: number;
      ratingCount: number;
      createdAt: Date;
      updatedAt: Date;
      isPublic: boolean;
      isFeatured: boolean;
      active: boolean;
      source: string;
    }> = [];

    // Process each role and its problems
    for (const [roleKey, roleContent] of Object.entries(ROLE_CONTENT)) {
      const dbRole = ROLE_MAPPING[roleKey];
      if (!dbRole) {
        console.warn(
          `⚠️  Skipping role "${roleKey}" - no database mapping found`
        );
        continue;
      }

      console.log(
        `\n📋 Processing ${roleContent.coreRole.title} (${roleKey})...`
      );
      console.log(`   Found ${roleContent.commonProblems.length} problems\n`);

      for (const problem of roleContent.commonProblems) {
        const titleLower = problem.title.toLowerCase();

        // Check if prompt already exists by title
        if (existingTitles.has(titleLower)) {
          console.log(`   ⏭️  Skipped: "${problem.title}" (already exists)`);
          skipped++;
          continue;
        }

        // Generate unique slug
        const baseSlug = generateSlug(problem.title);
        let slug = baseSlug;
        let suffix = 1;
        while (existingSlugs.has(slug)) {
          suffix++;
          slug = `${baseSlug}-${suffix}`;
        }
        existingSlugs.add(slug);

        // Generate prompt content
        const content = generatePromptContent(
          problem,
          roleContent.coreRole.title
        );

        // Extract pattern name
        const patternName = extractPatternName(problem.aiSolution);

        // Determine category
        const category = getCategoryFromProblem(problem.title, dbRole);

        // Generate tags
        const tags = generateTags(problem.title, dbRole);

        const prompt = {
          id: randomUUID(),
          slug,
          title: problem.title,
          description: problem.description.substring(0, 500), // Limit to 500 chars
          content,
          category,
          role: dbRole,
          pattern: patternName || undefined,
          tags,
          currentRevision: 1, // Start at 1 (schema requires min 1) - initial version
          // Note: auditVersion is stored in prompt_audit_results collection, not here
          // It will be 0 until the first audit runs
          views: 0,
          rating: 0,
          ratingCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          isPublic: true,
          isFeatured: false, // Can be marked as featured later
          active: true,
          source: 'seed' as const, // Research document prompts are seed content
        };

        promptsToCreate.push(prompt);
        console.log(`   ✅ Will create: "${problem.title}"`);
        console.log(`      Slug: ${slug}`);
        console.log(`      Pattern: ${patternName || 'none'}`);
        console.log(`      Category: ${category}`);
      }
    }

    console.log(`\n\n📊 Summary:`);
    console.log(`   - Will create: ${promptsToCreate.length} prompts`);
    console.log(`   - Skipped (already exist): ${skipped} prompts`);

    if (promptsToCreate.length === 0) {
      console.log('\n✨ All prompts already exist! Nothing to create.');
      process.exit(0);
    }

    // Insert prompts
    console.log(`\n💾 Creating prompts in database...`);
    for (const prompt of promptsToCreate) {
      try {
        await promptsCollection.insertOne(prompt);
        created++;
        console.log(`   ✅ Created: ${prompt.title}`);
      } catch (error: unknown) {
        const mongoError = error as { code?: number };
        if (mongoError.code === 11000) {
          // Duplicate key error (slug already exists)
          console.log(`   ⏭️  Skipped (duplicate): ${prompt.title}`);
          skipped++;
        } else {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error(
            `   ❌ Error creating "${prompt.title}":`,
            errorMessage
          );
        }
      }
    }

    console.log(`\n✨ Complete!`);
    console.log(`   - Created: ${created} prompts`);
    console.log(`   - Skipped: ${skipped} prompts`);
    console.log(`\n📝 Next Steps:`);
    console.log(
      `   1. Run audit: pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts`
    );
    console.log(
      `   2. Run improvements: pnpm tsx scripts/content/batch-improve-from-audits.ts`
    );
    console.log(`\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
