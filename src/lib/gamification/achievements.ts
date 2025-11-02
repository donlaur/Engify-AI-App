/**
 * Achievements System
 * Badges and achievements for various accomplishments
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'usage' | 'career' | 'social' | 'milestone';
  xpReward: number;
  requirement: {
    type: string;
    target: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS: Achievement[] = [
  // Milestone Achievements
  {
    id: 'welcome',
    name: 'Welcome Aboard',
    description: 'Join the Engify community',
    icon: '👋',
    category: 'milestone',
    xpReward: 10,
    requirement: { type: 'welcome', target: 1 },
    rarity: 'common',
  },

  // Learning Achievements
  {
    id: 'first-prompt',
    name: 'First Steps',
    description: 'Execute your first AI prompt',
    icon: '🎯',
    category: 'learning',
    xpReward: 50,
    requirement: { type: 'prompts_used', target: 1 },
    rarity: 'common',
  },
  {
    id: 'pattern-explorer',
    name: 'Pattern Explorer',
    description: 'Try all 5 basic patterns',
    icon: '🧭',
    category: 'learning',
    xpReward: 200,
    requirement: { type: 'patterns_tried', target: 5 },
    rarity: 'rare',
  },
  {
    id: 'pattern-master',
    name: 'Pattern Master',
    description: 'Master all 15 patterns',
    icon: '👑',
    category: 'learning',
    xpReward: 500,
    requirement: { type: 'patterns_mastered', target: 15 },
    rarity: 'legendary',
  },

  // Usage Achievements
  {
    id: 'power-user-10',
    name: 'Power User',
    description: 'Use 10 prompts',
    icon: '⚡',
    category: 'usage',
    xpReward: 100,
    requirement: { type: 'prompts_used', target: 10 },
    rarity: 'common',
  },
  {
    id: 'power-user-50',
    name: 'Super User',
    description: 'Use 50 prompts',
    icon: '🚀',
    category: 'usage',
    xpReward: 250,
    requirement: { type: 'prompts_used', target: 50 },
    rarity: 'rare',
  },
  {
    id: 'power-user-100',
    name: 'AI Champion',
    description: 'Use 100 prompts',
    icon: '🏆',
    category: 'usage',
    xpReward: 500,
    requirement: { type: 'prompts_used', target: 100 },
    rarity: 'epic',
  },
  {
    id: 'daily-streak-7',
    name: 'Week Warrior',
    description: '7-day streak',
    icon: '🔥',
    category: 'usage',
    xpReward: 150,
    requirement: { type: 'daily_streak', target: 7 },
    rarity: 'rare',
  },
  {
    id: 'daily-streak-30',
    name: 'Month Master',
    description: '30-day streak',
    icon: '💎',
    category: 'usage',
    xpReward: 500,
    requirement: { type: 'daily_streak', target: 30 },
    rarity: 'legendary',
  },

  // Career Achievements
  {
    id: 'skill-tracker',
    name: 'Skill Tracker',
    description: 'Track your first skill',
    icon: '📊',
    category: 'career',
    xpReward: 75,
    requirement: { type: 'skills_tracked', target: 1 },
    rarity: 'common',
  },
  {
    id: 'skill-developer',
    name: 'Skill Developer',
    description: 'Develop 5 different skills',
    icon: '🎓',
    category: 'career',
    xpReward: 200,
    requirement: { type: 'skills_tracked', target: 5 },
    rarity: 'rare',
  },
  {
    id: 'skill-master',
    name: 'Skill Master',
    description: 'Master a skill (80%+ improvement)',
    icon: '⭐',
    category: 'career',
    xpReward: 300,
    requirement: { type: 'skills_mastered', target: 1 },
    rarity: 'epic',
  },
  {
    id: 'promotion-ready',
    name: 'Promotion Ready',
    description: 'Reach 70% promotion readiness',
    icon: '🎯',
    category: 'career',
    xpReward: 400,
    requirement: { type: 'promotion_readiness', target: 70 },
    rarity: 'epic',
  },
  {
    id: 'career-climber',
    name: 'Career Climber',
    description: 'Reach 90% promotion readiness',
    icon: '🚀',
    category: 'career',
    xpReward: 600,
    requirement: { type: 'promotion_readiness', target: 90 },
    rarity: 'legendary',
  },

  // Social Achievements
  {
    id: 'team-player',
    name: 'Team Player',
    description: 'Join a team',
    icon: '👥',
    category: 'social',
    xpReward: 100,
    requirement: { type: 'teams_joined', target: 1 },
    rarity: 'common',
  },
  {
    id: 'helpful-teammate',
    name: 'Helpful Teammate',
    description: 'Share 5 prompts with team',
    icon: '🤝',
    category: 'social',
    xpReward: 150,
    requirement: { type: 'prompts_shared', target: 5 },
    rarity: 'rare',
  },
  {
    id: 'community-star',
    name: 'Community Star',
    description: 'Get 10 favorites on your prompts',
    icon: '⭐',
    category: 'social',
    xpReward: 200,
    requirement: { type: 'favorites_received', target: 10 },
    rarity: 'rare',
  },

  // Milestone Achievements
  {
    id: 'time-saver',
    name: 'Time Saver',
    description: 'Save 10 hours with AI',
    icon: '⏰',
    category: 'milestone',
    xpReward: 300,
    requirement: { type: 'time_saved', target: 10 },
    rarity: 'epic',
  },
  {
    id: 'efficiency-expert',
    name: 'Efficiency Expert',
    description: 'Save 50 hours with AI',
    icon: '⚡',
    category: 'milestone',
    xpReward: 750,
    requirement: { type: 'time_saved', target: 50 },
    rarity: 'legendary',
  },
  {
    id: 'level-5',
    name: 'Master Level',
    description: 'Reach Level 5',
    icon: '👑',
    category: 'milestone',
    xpReward: 1000,
    requirement: { type: 'level', target: 5 },
    rarity: 'legendary',
  },
];

/**
 * Get rarity color
 */
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-600';
    case 'rare':
      return 'text-blue-600';
    case 'epic':
      return 'text-purple-600';
    case 'legendary':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get rarity background
 */
export function getRarityBg(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'bg-gray-100';
    case 'rare':
      return 'bg-blue-100';
    case 'epic':
      return 'bg-purple-100';
    case 'legendary':
      return 'bg-yellow-100';
    default:
      return 'bg-gray-100';
  }
}
