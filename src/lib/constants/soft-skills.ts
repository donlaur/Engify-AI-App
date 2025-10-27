/**
 * Soft Skills Framework
 * Maps soft skills to career levels and provides improvement paths
 */

export type SoftSkill =
  | 'communication'
  | 'email-writing'
  | 'presentation'
  | 'active-listening'
  | 'conflict-resolution'
  | 'negotiation'
  | 'emotional-intelligence'
  | 'empathy'
  | 'leadership'
  | 'delegation'
  | 'mentoring'
  | 'coaching'
  | 'feedback-giving'
  | 'feedback-receiving'
  | 'collaboration'
  | 'teamwork'
  | 'cross-functional'
  | 'stakeholder-management'
  | 'time-management'
  | 'prioritization'
  | 'decision-making'
  | 'problem-solving'
  | 'critical-thinking'
  | 'adaptability'
  | 'resilience';

export interface SoftSkillInfo {
  name: string;
  description: string;
  icon: string;
  category: 'communication' | 'leadership' | 'collaboration' | 'personal';
  careerImpact: string;
  levelRequirements: {
    junior?: string;
    mid?: string;
    senior?: string;
    staff?: string;
    principal?: string;
  };
}

export const SOFT_SKILLS: Record<SoftSkill, SoftSkillInfo> = {
  // Communication Skills
  'communication': {
    name: 'Communication',
    description: 'Clear, concise, and effective written and verbal communication',
    icon: '💬',
    category: 'communication',
    careerImpact: 'Essential for all levels, critical for promotion',
    levelRequirements: {
      junior: 'Communicate clearly with team',
      mid: 'Communicate across teams',
      senior: 'Communicate with stakeholders',
      staff: 'Influence through communication',
      principal: 'Set communication standards',
    },
  },
  'email-writing': {
    name: 'Email Writing',
    description: 'Professional, clear, and actionable email communication',
    icon: '📧',
    category: 'communication',
    careerImpact: 'Most common workplace communication - huge impact',
    levelRequirements: {
      junior: 'Write clear status updates',
      mid: 'Write effective proposals',
      senior: 'Write executive summaries',
      staff: 'Write strategic communications',
      principal: 'Write company-wide announcements',
    },
  },
  'presentation': {
    name: 'Presentation Skills',
    description: 'Deliver compelling presentations to various audiences',
    icon: '🎤',
    category: 'communication',
    careerImpact: 'Required for senior+ roles, visibility booster',
    levelRequirements: {
      mid: 'Present to team',
      senior: 'Present to leadership',
      staff: 'Present to executives',
      principal: 'Keynote presentations',
    },
  },
  'active-listening': {
    name: 'Active Listening',
    description: 'Truly hear and understand others\' perspectives',
    icon: '👂',
    category: 'communication',
    careerImpact: 'Foundation of leadership and collaboration',
    levelRequirements: {
      junior: 'Listen to understand tasks',
      mid: 'Listen to understand problems',
      senior: 'Listen to understand people',
      staff: 'Listen to understand strategy',
    },
  },
  'conflict-resolution': {
    name: 'Conflict Resolution',
    description: 'Navigate and resolve disagreements constructively',
    icon: '🤝',
    category: 'leadership',
    careerImpact: 'Critical for team harmony and productivity',
    levelRequirements: {
      mid: 'Resolve peer conflicts',
      senior: 'Mediate team conflicts',
      staff: 'Resolve cross-team conflicts',
      principal: 'Resolve organizational conflicts',
    },
  },
  'negotiation': {
    name: 'Negotiation',
    description: 'Reach mutually beneficial agreements',
    icon: '🤝',
    category: 'leadership',
    careerImpact: 'Essential for salary, resources, and influence',
    levelRequirements: {
      mid: 'Negotiate deadlines',
      senior: 'Negotiate resources',
      staff: 'Negotiate priorities',
      principal: 'Negotiate strategy',
    },
  },
  'emotional-intelligence': {
    name: 'Emotional Intelligence',
    description: 'Understand and manage emotions (yours and others)',
    icon: '🧠',
    category: 'personal',
    careerImpact: 'Separates good leaders from great ones',
    levelRequirements: {
      mid: 'Self-awareness',
      senior: 'Empathy for team',
      staff: 'Organizational awareness',
      principal: 'Cultural intelligence',
    },
  },
  'empathy': {
    name: 'Empathy',
    description: 'Understand and share feelings of others',
    icon: '❤️',
    category: 'personal',
    careerImpact: 'Foundation of trust and collaboration',
    levelRequirements: {
      junior: 'Empathy for teammates',
      mid: 'Empathy for users',
      senior: 'Empathy for stakeholders',
      staff: 'Empathy at scale',
    },
  },
  'leadership': {
    name: 'Leadership',
    description: 'Inspire and guide others toward goals',
    icon: '👑',
    category: 'leadership',
    careerImpact: 'Required for senior+ promotions',
    levelRequirements: {
      mid: 'Lead by example',
      senior: 'Lead projects',
      staff: 'Lead teams',
      principal: 'Lead organization',
    },
  },
  'delegation': {
    name: 'Delegation',
    description: 'Effectively assign work and empower others',
    icon: '📋',
    category: 'leadership',
    careerImpact: 'Multiplies your impact',
    levelRequirements: {
      senior: 'Delegate tasks',
      staff: 'Delegate projects',
      principal: 'Delegate strategy',
    },
  },
  'mentoring': {
    name: 'Mentoring',
    description: 'Guide and develop others\' careers',
    icon: '🎓',
    category: 'leadership',
    careerImpact: 'Expected at senior+, required at staff+',
    levelRequirements: {
      senior: 'Mentor juniors',
      staff: 'Mentor across teams',
      principal: 'Mentor leaders',
    },
  },
  'coaching': {
    name: 'Coaching',
    description: 'Help others discover their own solutions',
    icon: '🏆',
    category: 'leadership',
    careerImpact: 'Advanced leadership skill',
    levelRequirements: {
      staff: 'Coach team members',
      principal: 'Coach managers',
    },
  },
  'feedback-giving': {
    name: 'Giving Feedback',
    description: 'Deliver constructive feedback effectively',
    icon: '💡',
    category: 'leadership',
    careerImpact: 'Essential for team growth',
    levelRequirements: {
      mid: 'Give peer feedback',
      senior: 'Give performance feedback',
      staff: 'Give strategic feedback',
    },
  },
  'feedback-receiving': {
    name: 'Receiving Feedback',
    description: 'Accept and act on feedback gracefully',
    icon: '🎯',
    category: 'personal',
    careerImpact: 'Accelerates personal growth',
    levelRequirements: {
      junior: 'Accept feedback',
      mid: 'Seek feedback',
      senior: 'Act on feedback',
      staff: 'Model feedback culture',
    },
  },
  'collaboration': {
    name: 'Collaboration',
    description: 'Work effectively with diverse teams',
    icon: '🤝',
    category: 'collaboration',
    careerImpact: 'Core skill for all levels',
    levelRequirements: {
      junior: 'Collaborate with team',
      mid: 'Collaborate across teams',
      senior: 'Facilitate collaboration',
      staff: 'Build collaboration culture',
    },
  },
  'teamwork': {
    name: 'Teamwork',
    description: 'Contribute positively to team dynamics',
    icon: '👥',
    category: 'collaboration',
    careerImpact: 'Foundation of productivity',
    levelRequirements: {
      junior: 'Be a good teammate',
      mid: 'Strengthen team',
      senior: 'Build high-performing teams',
    },
  },
  'cross-functional': {
    name: 'Cross-Functional Work',
    description: 'Bridge different departments and disciplines',
    icon: '🌉',
    category: 'collaboration',
    careerImpact: 'Required for senior+ impact',
    levelRequirements: {
      senior: 'Work with other teams',
      staff: 'Lead cross-functional initiatives',
      principal: 'Align organization',
    },
  },
  'stakeholder-management': {
    name: 'Stakeholder Management',
    description: 'Manage expectations and relationships',
    icon: '🎭',
    category: 'collaboration',
    careerImpact: 'Critical for senior+ success',
    levelRequirements: {
      senior: 'Manage project stakeholders',
      staff: 'Manage executive stakeholders',
      principal: 'Manage board/investors',
    },
  },
  'time-management': {
    name: 'Time Management',
    description: 'Use time effectively and efficiently',
    icon: '⏰',
    category: 'personal',
    careerImpact: 'Multiplies productivity',
    levelRequirements: {
      junior: 'Manage your time',
      mid: 'Manage team time',
      senior: 'Optimize time allocation',
    },
  },
  'prioritization': {
    name: 'Prioritization',
    description: 'Focus on what matters most',
    icon: '🎯',
    category: 'personal',
    careerImpact: 'Separates busy from effective',
    levelRequirements: {
      mid: 'Prioritize tasks',
      senior: 'Prioritize projects',
      staff: 'Prioritize strategy',
      principal: 'Set organizational priorities',
    },
  },
  'decision-making': {
    name: 'Decision Making',
    description: 'Make sound decisions with incomplete information',
    icon: '🤔',
    category: 'leadership',
    careerImpact: 'Core leadership responsibility',
    levelRequirements: {
      mid: 'Make technical decisions',
      senior: 'Make project decisions',
      staff: 'Make strategic decisions',
      principal: 'Make organizational decisions',
    },
  },
  'problem-solving': {
    name: 'Problem Solving',
    description: 'Identify and solve complex problems',
    icon: '🔧',
    category: 'personal',
    careerImpact: 'Core value of engineers',
    levelRequirements: {
      junior: 'Solve defined problems',
      mid: 'Solve ambiguous problems',
      senior: 'Solve systemic problems',
      staff: 'Solve organizational problems',
    },
  },
  'critical-thinking': {
    name: 'Critical Thinking',
    description: 'Analyze situations objectively and logically',
    icon: '🧩',
    category: 'personal',
    careerImpact: 'Foundation of good decisions',
    levelRequirements: {
      mid: 'Question assumptions',
      senior: 'Challenge status quo',
      staff: 'Drive strategic thinking',
    },
  },
  'adaptability': {
    name: 'Adaptability',
    description: 'Thrive in changing environments',
    icon: '🌊',
    category: 'personal',
    careerImpact: 'Essential in fast-moving tech',
    levelRequirements: {
      junior: 'Adapt to feedback',
      mid: 'Adapt to change',
      senior: 'Lead through change',
      staff: 'Drive transformation',
    },
  },
  'resilience': {
    name: 'Resilience',
    description: 'Bounce back from setbacks',
    icon: '💪',
    category: 'personal',
    careerImpact: 'Long-term career success',
    levelRequirements: {
      junior: 'Handle failure',
      mid: 'Learn from failure',
      senior: 'Model resilience',
      staff: 'Build resilient teams',
    },
  },
};

/**
 * Get soft skills required for career level
 */
export function getSoftSkillsForLevel(level: string): SoftSkill[] {
  const skills: SoftSkill[] = [];
  
  for (const [skillKey, skillInfo] of Object.entries(SOFT_SKILLS)) {
    if (skillInfo.levelRequirements[level as keyof typeof skillInfo.levelRequirements]) {
      skills.push(skillKey as SoftSkill);
    }
  }
  
  return skills;
}

/**
 * Get soft skills needed for promotion
 */
export function getSoftSkillsForPromotion(currentLevel: string, targetLevel: string): SoftSkill[] {
  const currentSkills = new Set(getSoftSkillsForLevel(currentLevel));
  const targetSkills = getSoftSkillsForLevel(targetLevel);
  
  return targetSkills.filter(skill => !currentSkills.has(skill));
}

/**
 * Get soft skill categories
 */
export function getSoftSkillsByCategory(category: string): SoftSkill[] {
  return Object.entries(SOFT_SKILLS)
    .filter(([_, info]) => info.category === category)
    .map(([skill, _]) => skill as SoftSkill);
}
