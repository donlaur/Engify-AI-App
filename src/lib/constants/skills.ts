/**
 * Career Skills Mapping
 * Maps prompts and patterns to career development skills
 */

import { SkillCategory } from '@/lib/types/user';

/**
 * Prompt categories to skill mapping
 */
export const PROMPT_SKILL_MAP: Record<string, SkillCategory[]> = {
  // Code Review prompts develop these skills
  'code-review': ['communication', 'technical-leadership', 'code-quality'],
  'code-review-security': ['technical-leadership', 'code-quality'],
  'code-review-performance': ['technical-leadership', 'code-quality'],
  
  // Architecture prompts
  'architecture': ['system-design', 'architecture', 'technical-leadership'],
  'system-design': ['system-design', 'architecture'],
  'api-design': ['architecture', 'technical-leadership'],
  
  // Documentation prompts
  'documentation': ['communication', 'technical-leadership'],
  'api-docs': ['communication', 'technical-leadership'],
  'readme': ['communication'],
  
  // Mentoring prompts
  'mentoring': ['mentoring', 'communication', 'technical-leadership'],
  'code-explanation': ['mentoring', 'communication'],
  'teaching': ['mentoring', 'communication'],
  
  // Collaboration prompts
  'team-communication': ['communication', 'collaboration'],
  'cross-team': ['collaboration', 'communication'],
  'stakeholder-update': ['communication', 'collaboration'],
  
  // Project Management
  'project-planning': ['project-management', 'technical-leadership'],
  'sprint-planning': ['project-management', 'collaboration'],
  'estimation': ['project-management'],
  
  // Technical Leadership
  'technical-decision': ['technical-leadership', 'architecture'],
  'rfc': ['technical-leadership', 'communication', 'architecture'],
  'design-doc': ['technical-leadership', 'system-design', 'communication'],
};

/**
 * Pattern to skill mapping
 */
export const PATTERN_SKILL_MAP: Record<string, SkillCategory[]> = {
  'persona': ['communication'],
  'chain-of-thought': ['technical-leadership', 'communication'],
  'few-shot': ['communication'],
  'template': ['communication'],
  'cognitive-verifier': ['technical-leadership'],
  'question-refinement': ['communication'],
  'context-control': ['technical-leadership'],
  'output-formatting': ['communication'],
  'constraint': ['technical-leadership'],
  'tree-of-thoughts': ['system-design', 'architecture'],
  'react': ['technical-leadership'],
  'self-consistency': ['code-quality'],
  'meta-prompting': ['technical-leadership'],
  'rag': ['architecture', 'system-design'],
};

/**
 * Skills required for each career level
 */
export const LEVEL_SKILL_REQUIREMENTS: Record<string, {
  required: SkillCategory[];
  developing: SkillCategory[];
}> = {
  'junior': {
    required: ['code-quality'],
    developing: ['communication'],
  },
  'mid': {
    required: ['code-quality', 'communication'],
    developing: ['collaboration', 'technical-leadership'],
  },
  'senior': {
    required: ['code-quality', 'communication', 'collaboration', 'technical-leadership'],
    developing: ['system-design', 'mentoring'],
  },
  'staff': {
    required: ['technical-leadership', 'system-design', 'communication', 'mentoring'],
    developing: ['architecture', 'project-management'],
  },
  'principal': {
    required: ['architecture', 'system-design', 'technical-leadership', 'mentoring', 'project-management'],
    developing: ['collaboration'],
  },
};

/**
 * Skill display names and descriptions
 */
export const SKILL_INFO: Record<SkillCategory, {
  name: string;
  description: string;
  icon: string;
}> = {
  'communication': {
    name: 'Communication',
    description: 'Clear technical writing and documentation',
    icon: '💬',
  },
  'technical-leadership': {
    name: 'Technical Leadership',
    description: 'Making technical decisions and guiding teams',
    icon: '🎯',
  },
  'system-design': {
    name: 'System Design',
    description: 'Designing scalable, reliable systems',
    icon: '🏗️',
  },
  'architecture': {
    name: 'Architecture',
    description: 'High-level system architecture and patterns',
    icon: '🏛️',
  },
  'mentoring': {
    name: 'Mentoring',
    description: 'Teaching and developing other engineers',
    icon: '👥',
  },
  'collaboration': {
    name: 'Collaboration',
    description: 'Working effectively across teams',
    icon: '🤝',
  },
  'project-management': {
    name: 'Project Management',
    description: 'Planning and executing projects',
    icon: '📋',
  },
  'code-quality': {
    name: 'Code Quality',
    description: 'Writing clean, maintainable code',
    icon: '✨',
  },
};

/**
 * Get skills for a prompt category
 */
export function getSkillsForPrompt(category: string): SkillCategory[] {
  return PROMPT_SKILL_MAP[category] || [];
}

/**
 * Get skills for a pattern
 */
export function getSkillsForPattern(patternId: string): SkillCategory[] {
  return PATTERN_SKILL_MAP[patternId] || [];
}

/**
 * Get required skills for a level
 */
export function getRequiredSkills(level: string): SkillCategory[] {
  return LEVEL_SKILL_REQUIREMENTS[level]?.required || [];
}

/**
 * Get developing skills for a level
 */
export function getDevelopingSkills(level: string): SkillCategory[] {
  return LEVEL_SKILL_REQUIREMENTS[level]?.developing || [];
}

/**
 * Check if a skill is required for next level
 */
export function isSkillRequiredForPromotion(
  currentLevel: string,
  targetLevel: string,
  skill: SkillCategory
): boolean {
  const targetRequired = getRequiredSkills(targetLevel);
  const currentRequired = getRequiredSkills(currentLevel);
  
  return targetRequired.includes(skill) && !currentRequired.includes(skill);
}
