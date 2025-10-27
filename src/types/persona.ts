/**
 * Persona & Role System
 * Allows users to define their role and experience, plus impersonate others for empathy
 */

export type Role = 
  | 'engineer'
  | 'senior-engineer'
  | 'engineering-manager'
  | 'tech-lead'
  | 'architect'
  | 'cto'
  | 'product-manager'
  | 'designer'
  | 'ux-researcher'
  | 'qa-engineer'
  | 'devops'
  | 'data-scientist'
  | 'student'
  | 'educator';

export type ExperienceLevel = 
  | 'beginner'      // 0-2 years
  | 'intermediate'  // 2-5 years
  | 'advanced'      // 5-10 years
  | 'expert'        // 10-15 years
  | 'master';       // 15+ years

export interface Persona {
  // Primary Identity
  role: Role;
  experienceLevel: ExperienceLevel;
  yearsOfExperience: number;
  
  // Optional Details
  industry?: string;
  teamSize?: number;
  focusAreas?: string[];
  
  // Learning Preferences
  learningStyle?: 'visual' | 'hands-on' | 'theoretical' | 'mixed';
  preferredPatterns?: string[];
  
  // Community
  isPublic?: boolean;
  bio?: string;
}

export interface ImpersonationMode {
  isActive: boolean;
  targetRole: Role;
  targetExperience: ExperienceLevel;
  reason: 'empathy' | 'learning' | 'helping' | 'exploring';
  notes?: string;
}

export interface UserProfile {
  // Real Identity
  actualPersona: Persona;
  
  // Current View (may be impersonating)
  currentPersona: Persona;
  
  // Impersonation
  impersonation: ImpersonationMode;
  
  // History
  impersonationHistory?: Array<{
    role: Role;
    experience: ExperienceLevel;
    timestamp: Date;
    duration: number; // minutes
    insights?: string;
  }>;
}

// Role definitions with descriptions
export const ROLE_DEFINITIONS: Record<Role, {
  title: string;
  description: string;
  icon: string;
  typicalChallenges: string[];
  recommendedPatterns: string[];
}> = {
  'engineer': {
    title: 'Software Engineer',
    description: 'Building features, fixing bugs, writing code',
    icon: 'code',
    typicalChallenges: [
      'Understanding requirements',
      'Debugging complex issues',
      'Writing clean code',
      'Learning new technologies',
    ],
    recommendedPatterns: [
      'Chain of Thought',
      'Few-Shot Learning',
      'Step-by-Step',
    ],
  },
  'senior-engineer': {
    title: 'Senior Engineer',
    description: 'Leading technical decisions, mentoring, architecture',
    icon: 'award',
    typicalChallenges: [
      'System design decisions',
      'Mentoring junior developers',
      'Balancing tech debt',
      'Code review efficiency',
    ],
    recommendedPatterns: [
      'Chain of Thought',
      'Socratic Method',
      'Comparative Analysis',
    ],
  },
  'engineering-manager': {
    title: 'Engineering Manager',
    description: 'Managing teams, planning sprints, career development',
    icon: 'users',
    typicalChallenges: [
      'Team productivity',
      '1-on-1 effectiveness',
      'Sprint planning',
      'Performance reviews',
    ],
    recommendedPatterns: [
      'Role Prompting',
      'Perspective Taking',
      'Structured Output',
    ],
  },
  'tech-lead': {
    title: 'Tech Lead',
    description: 'Technical direction, architecture, team guidance',
    icon: 'compass',
    typicalChallenges: [
      'Technical roadmap',
      'Architecture decisions',
      'Team alignment',
      'Stakeholder communication',
    ],
    recommendedPatterns: [
      'Chain of Thought',
      'Comparative Analysis',
      'Structured Output',
    ],
  },
  'architect': {
    title: 'Software Architect',
    description: 'System design, scalability, technical strategy',
    icon: 'building',
    typicalChallenges: [
      'System scalability',
      'Technology selection',
      'Cross-team coordination',
      'Long-term planning',
    ],
    recommendedPatterns: [
      'Comparative Analysis',
      'Chain of Thought',
      'Constraint Satisfaction',
    ],
  },
  'cto': {
    title: 'CTO / VP Engineering',
    description: 'Technical strategy, team building, business alignment',
    icon: 'briefcase',
    typicalChallenges: [
      'Technical strategy',
      'Team scaling',
      'Budget planning',
      'Executive communication',
    ],
    recommendedPatterns: [
      'Executive Summary',
      'Strategic Analysis',
      'Risk Assessment',
    ],
  },
  'product-manager': {
    title: 'Product Manager',
    description: 'Product strategy, roadmap, user needs',
    icon: 'target',
    typicalChallenges: [
      'Feature prioritization',
      'User research',
      'Stakeholder alignment',
      'Roadmap planning',
    ],
    recommendedPatterns: [
      'User Story',
      'Perspective Taking',
      'Structured Output',
    ],
  },
  'designer': {
    title: 'Product Designer',
    description: 'User experience, visual design, prototyping',
    icon: 'palette',
    typicalChallenges: [
      'User research',
      'Design systems',
      'Stakeholder feedback',
      'Accessibility',
    ],
    recommendedPatterns: [
      'Perspective Taking',
      'Few-Shot Learning',
      'Iterative Refinement',
    ],
  },
  'ux-researcher': {
    title: 'UX Researcher',
    description: 'User research, testing, insights',
    icon: 'search',
    typicalChallenges: [
      'Research planning',
      'Data synthesis',
      'Insight communication',
      'Stakeholder buy-in',
    ],
    recommendedPatterns: [
      'Structured Output',
      'Comparative Analysis',
      'Perspective Taking',
    ],
  },
  'qa-engineer': {
    title: 'QA Engineer',
    description: 'Testing, quality assurance, automation',
    icon: 'checkCircle',
    typicalChallenges: [
      'Test coverage',
      'Automation strategy',
      'Bug reporting',
      'Release confidence',
    ],
    recommendedPatterns: [
      'Step-by-Step',
      'Edge Case Analysis',
      'Structured Output',
    ],
  },
  'devops': {
    title: 'DevOps Engineer',
    description: 'Infrastructure, CI/CD, monitoring',
    icon: 'server',
    typicalChallenges: [
      'System reliability',
      'Deployment automation',
      'Incident response',
      'Cost optimization',
    ],
    recommendedPatterns: [
      'Troubleshooting',
      'Chain of Thought',
      'Constraint Satisfaction',
    ],
  },
  'data-scientist': {
    title: 'Data Scientist',
    description: 'Data analysis, ML models, insights',
    icon: 'barChart',
    typicalChallenges: [
      'Model selection',
      'Data quality',
      'Insight communication',
      'Production deployment',
    ],
    recommendedPatterns: [
      'Chain of Thought',
      'Comparative Analysis',
      'Structured Output',
    ],
  },
  'student': {
    title: 'Student',
    description: 'Learning, exploring, building projects',
    icon: 'graduationCap',
    typicalChallenges: [
      'Learning fundamentals',
      'Project ideas',
      'Career guidance',
      'Skill development',
    ],
    recommendedPatterns: [
      'Few-Shot Learning',
      'Step-by-Step',
      'Socratic Method',
    ],
  },
  'educator': {
    title: 'Educator',
    description: 'Teaching, curriculum, student support',
    icon: 'book',
    typicalChallenges: [
      'Curriculum design',
      'Student engagement',
      'Assessment creation',
      'Concept explanation',
    ],
    recommendedPatterns: [
      'Socratic Method',
      'Few-Shot Learning',
      'Structured Output',
    ],
  },
};

// Experience level definitions
export const EXPERIENCE_LEVELS: Record<ExperienceLevel, {
  label: string;
  yearsRange: string;
  description: string;
  characteristics: string[];
}> = {
  'beginner': {
    label: 'Beginner',
    yearsRange: '0-2 years',
    description: 'Learning fundamentals, building first projects',
    characteristics: [
      'Learning syntax and basics',
      'Following tutorials',
      'Asking lots of questions',
      'Building confidence',
    ],
  },
  'intermediate': {
    label: 'Intermediate',
    yearsRange: '2-5 years',
    description: 'Comfortable with core concepts, building independently',
    characteristics: [
      'Working independently',
      'Understanding patterns',
      'Contributing to teams',
      'Learning best practices',
    ],
  },
  'advanced': {
    label: 'Advanced',
    yearsRange: '5-10 years',
    description: 'Deep expertise, mentoring others, leading projects',
    characteristics: [
      'Leading projects',
      'Mentoring others',
      'Making architecture decisions',
      'Optimizing systems',
    ],
  },
  'expert': {
    label: 'Expert',
    yearsRange: '10-15 years',
    description: 'Industry expert, thought leader, strategic thinker',
    characteristics: [
      'Industry recognition',
      'Strategic thinking',
      'Cross-team leadership',
      'Innovation driver',
    ],
  },
  'master': {
    label: 'Master',
    yearsRange: '15+ years',
    description: 'Veteran expert, shaping industry, mentoring leaders',
    characteristics: [
      'Shaping industry standards',
      'Mentoring leaders',
      'Strategic vision',
      'Deep wisdom',
    ],
  },
};

// Helper functions
export function getRecommendedPrompts(persona: Persona): string[] {
  const roleDef = ROLE_DEFINITIONS[persona.role];
  return roleDef.recommendedPatterns;
}

export function getPersonaDescription(persona: Persona): string {
  const roleDef = ROLE_DEFINITIONS[persona.role];
  const expDef = EXPERIENCE_LEVELS[persona.experienceLevel];
  
  return `${expDef.label} ${roleDef.title} with ${persona.yearsOfExperience} years of experience`;
}

export function canImpersonate(actualRole: Role, targetRole: Role): boolean {
  // Everyone can impersonate for empathy/learning
  return true;
}

export function getImpersonationInsights(
  actualRole: Role,
  targetRole: Role
): string[] {
  const actualDef = ROLE_DEFINITIONS[actualRole];
  const targetDef = ROLE_DEFINITIONS[targetRole];
  
  return [
    `As a ${targetDef.title}, you'll focus on: ${targetDef.typicalChallenges[0]}`,
    `Try using these patterns: ${targetDef.recommendedPatterns.join(', ')}`,
    `This helps you understand ${targetDef.title} perspectives`,
  ];
}
