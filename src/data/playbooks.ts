/**
 * Playbook Categories and Recipes
 *
 * Centralized data for all playbooks and prompt recipes
 */

export interface PlaybookRecipe {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface PlaybookCategory {
  id: string;
  name: string;
  description: string;
  recipes: PlaybookRecipe[];
}

export const playbookCategories: PlaybookCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Essential prompts for beginners',
    recipes: [],
  },
];
