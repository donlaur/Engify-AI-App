/**
 * Gamification Levels & XP System
 * Rewards users for growth, learning, and usage
 */

export interface Level {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  rewards: string[];
  unlockedPatterns: number; // How many patterns unlocked at this level
  perks: string[];
}

export const LEVELS: Level[] = [
  {
    level: 1,
    name: 'Novice',
    minXP: 0,
    maxXP: 100,
    rewards: ['Welcome Badge', 'First 3 Patterns'],
    unlockedPatterns: 3,
    perks: ['Access to basic patterns', '10 prompts/day'],
  },
  {
    level: 2,
    name: 'Learner',
    minXP: 100,
    maxXP: 300,
    rewards: ['Learner Badge', '2 More Patterns'],
    unlockedPatterns: 5,
    perks: ['Access to 5 patterns', '25 prompts/day', 'Career assessment'],
  },
  {
    level: 3,
    name: 'Practitioner',
    minXP: 300,
    maxXP: 700,
    rewards: ['Practitioner Badge', '3 More Patterns'],
    unlockedPatterns: 8,
    perks: ['Access to 8 patterns', '50 prompts/day', 'Skill tracking'],
  },
  {
    level: 4,
    name: 'Expert',
    minXP: 700,
    maxXP: 1500,
    rewards: ['Expert Badge', '4 More Patterns'],
    unlockedPatterns: 12,
    perks: ['Access to 12 patterns', '100 prompts/day', 'Career recommendations'],
  },
  {
    level: 5,
    name: 'Master',
    minXP: 1500,
    maxXP: 999999,
    rewards: ['Master Badge', 'All Patterns'],
    unlockedPatterns: 15,
    perks: ['All 15 patterns', 'Unlimited prompts', 'Priority support', 'Custom patterns'],
  },
];

/**
 * XP earning actions
 */
export const XP_REWARDS = {
  // Basic actions
  PROMPT_USED: 5,
  PATTERN_USED: 10,
  FIRST_PROMPT_OF_DAY: 20,
  
  // Learning
  PATTERN_COMPLETED: 50,
  PATHWAY_COMPLETED: 100,
  ASSESSMENT_COMPLETED: 75,
  
  // Engagement
  DAILY_STREAK_DAY: 15,
  WEEKLY_STREAK: 50,
  MONTHLY_STREAK: 200,
  
  // Quality
  PROMPT_RATED_HELPFUL: 10,
  SHARED_PROMPT: 25,
  PROMPT_FAVORITED_BY_OTHERS: 15,
  
  // Career
  SKILL_IMPROVED: 30,
  CAREER_ASSESSMENT: 100,
  PROMOTION_READINESS_MILESTONE: 150, // Every 20%
  
  // Social
  TEAM_JOINED: 50,
  HELPED_TEAMMATE: 25,
  TEAM_CHALLENGE_COMPLETED: 100,
  
  // Milestones
  FIRST_10_PROMPTS: 100,
  FIRST_50_PROMPTS: 250,
  FIRST_100_PROMPTS: 500,
  FIRST_SKILL_MASTERED: 200,
};

/**
 * Get level from XP
 */
export function getLevelFromXP(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

/**
 * Get XP needed for next level
 */
export function getXPForNextLevel(currentXP: number): number {
  const currentLevel = getLevelFromXP(currentXP);
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
  
  if (!nextLevel) return 0; // Max level
  
  return nextLevel.minXP - currentXP;
}

/**
 * Get progress to next level (0-100%)
 */
export function getProgressToNextLevel(currentXP: number): number {
  const currentLevel = getLevelFromXP(currentXP);
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
  
  if (!nextLevel) return 100; // Max level
  
  const xpInCurrentLevel = currentXP - currentLevel.minXP;
  const xpNeededForLevel = nextLevel.minXP - currentLevel.minXP;
  
  return Math.round((xpInCurrentLevel / xpNeededForLevel) * 100);
}

/**
 * Check if user can access pattern based on level
 */
export function canAccessPattern(userXP: number, patternIndex: number): boolean {
  const level = getLevelFromXP(userXP);
  return patternIndex < level.unlockedPatterns;
}
