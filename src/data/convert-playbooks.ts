/**
 * Convert Playbooks to Prompt Schema
 *
 * This script converts the playbook format to our Prompt schema
 * so they can be displayed in the library
 */

import type {
  Prompt,
  PromptCategory,
  UserRole,
  ExperienceLevel,
  PromptPattern,
} from '@/lib/schemas/prompt';
import { playbookCategories } from './playbooks';

// Map playbook categories to our prompt categories
const categoryMap: Record<string, string> = {
  'eng-junior': 'learning',
  'eng-mid': 'code-generation',
  'eng-senior': 'architecture',
  'pm-associate': 'general',
  'pm-senior': 'general',
  'product-owners': 'general',
  'scrum-masters': 'general',
  'ux-designers': 'general',
  'qa-engineers': 'testing',
  architects: 'architecture',
  'devops-sre': 'general',
};

// Map playbook category IDs to roles and experience levels
const categoryToRoleAndLevel: Record<string, { role: string; level: string }> =
  {
    'eng-junior': { role: 'engineer', level: 'junior' },
    'eng-mid': { role: 'engineer', level: 'mid-level' },
    'eng-senior': { role: 'engineer', level: 'senior' },
    'pm-associate': { role: 'product-manager', level: 'junior' },
    'pm-mid': { role: 'product-manager', level: 'mid-level' },
    'pm-senior': { role: 'product-manager', level: 'senior' },
    'product-owners': { role: 'product-owner', level: 'mid-level' },
    'scrum-masters': { role: 'scrum-master', level: 'mid-level' },
    'designer-junior': { role: 'designer', level: 'junior' },
    'designer-mid': { role: 'designer', level: 'mid-level' },
    'designer-senior': { role: 'designer', level: 'senior' },
    'leader-team': { role: 'engineering-manager', level: 'lead' },
    'leader-director': { role: 'c-level', level: 'director' },
    'qa-engineers': { role: 'qa', level: 'mid-level' },
    architects: { role: 'architect', level: 'senior' },
    'devops-sre': { role: 'devops-sre', level: 'mid-level' },
  };

export function convertPlaybooksToPrompts(): Omit<
  Prompt,
  'createdAt' | 'updatedAt'
>[] {
  const prompts: Omit<Prompt, 'createdAt' | 'updatedAt'>[] = [];

  playbookCategories.forEach((category) => {
    category.recipes.forEach((recipe, index) => {
      const roleAndLevel = categoryToRoleAndLevel[category.id];
      const prompt: Omit<Prompt, 'createdAt' | 'updatedAt'> = {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        content: recipe.description, // Use description as content since prompt doesn't exist
        category: (categoryMap[category.id] || 'general') as PromptCategory,
        role: (roleAndLevel?.role || 'engineer') as UserRole,
        experienceLevel: (roleAndLevel?.level ||
          'mid-level') as ExperienceLevel,
        pattern: detectPattern(recipe.description) as PromptPattern,
        tags: generateTags(recipe.title, recipe.description, category.name),
        views: Math.floor(Math.random() * 500) + 100, // Random views for now
        rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5-5.0 rating
        ratingCount: Math.floor(Math.random() * 20) + 5,
        isPublic: true,
        isFeatured: index === 0, // First in each category is featured
      };

      prompts.push(prompt);
    });
  });

  return prompts;
}

// Detect which pattern a prompt uses based on content
function detectPattern(promptText: string): string {
  const text = promptText.toLowerCase();

  if (text.includes('act as') || text.includes('you are')) return 'persona';
  if (
    text.includes('step-by-step') ||
    (text.includes('first') && text.includes('then'))
  )
    return 'chain-of-thought';
  if (
    text.includes('format') ||
    text.includes('structure') ||
    text.includes('template')
  )
    return 'template';
  if (text.includes('audience') || text.includes('explain to'))
    return 'audience-persona';
  if (text.includes('question') || text.includes('ask me'))
    return 'question-refinement';

  return 'persona'; // Default
}

// Generate tags from title, description, and category
function generateTags(
  title: string,
  description: string,
  categoryTitle: string
): string[] {
  const tags: Set<string> = new Set();

  // Add category-based tags
  tags.add(categoryTitle.toLowerCase().replace(/[:\s]+/g, '-'));

  // Extract keywords from title
  const titleWords = title.toLowerCase().split(/\s+/);
  titleWords.forEach((word) => {
    if (
      word.length > 4 &&
      !['assistant', 'helper', 'builder', 'generator'].includes(word)
    ) {
      tags.add(word);
    }
  });

  // Add common engineering tags
  if (description.includes('code')) tags.add('code');
  if (description.includes('review')) tags.add('review');
  if (description.includes('debug')) tags.add('debugging');
  if (description.includes('test')) tags.add('testing');
  if (description.includes('architecture') || description.includes('design'))
    tags.add('architecture');
  if (description.includes('document')) tags.add('documentation');
  if (description.includes('plan')) tags.add('planning');
  if (description.includes('team')) tags.add('team');

  return Array.from(tags).slice(0, 5); // Max 5 tags
}

export function getPlaybookPromptsWithTimestamps(): Prompt[] {
  const prompts = convertPlaybooksToPrompts();
  const now = new Date();

  return prompts.map((prompt, index) => ({
    ...prompt,
    createdAt: new Date(
      now.getTime() - (prompts.length - index) * 12 * 60 * 60 * 1000
    ), // 12 hours apart
    updatedAt: new Date(
      now.getTime() - (prompts.length - index) * 12 * 60 * 60 * 1000
    ),
  }));
}
