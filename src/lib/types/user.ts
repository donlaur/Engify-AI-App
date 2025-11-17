/**
 * User Types with Career Context
 * Enhanced to support career ladder integration
 */

export type UserRole = 
  | 'c-level'
  | 'engineering-manager'
  | 'engineer'
  | 'pm'
  | 'designer'
  | 'qa';

export type CareerLevel = 
  | 'junior'      // L1-L2
  | 'mid'         // L3
  | 'senior'      // L4
  | 'staff'       // L5
  | 'principal';  // L6+

export type CompanySize = 
  | 'startup'     // 1-50
  | 'mid'         // 51-500
  | 'enterprise'; // 500+

export type CareerGoal = 
  | 'promotion'       // Want to level up
  | 'skill-building'  // Improve current level
  | 'job-search';     // Looking for new role

export interface UserCareerContext {
  level: CareerLevel;
  companySize: CompanySize;
  careerGoal?: CareerGoal;
  targetLevel?: CareerLevel; // What level they're aiming for
  yearsExperience?: number;
}

export interface User {
  _id?: string;
  email: string;
  name?: string;
  password?: string; // Hashed
  role: UserRole;
  
  // Career context (NEW)
  careerContext?: UserCareerContext;
  
  // Subscription
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  
  // Settings
  emailVerified?: boolean;
  onboardingCompleted?: boolean;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    weeklyReports?: boolean;
  };

  // API Usage Notification Preferences
  apiNotificationPreferences?: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    thresholds: {
      fifty: boolean;   // 50% usage
      eighty: boolean;  // 80% usage
      ninety: boolean;  // 90% usage
      hundred: boolean; // 100% usage (exceeded)
    };
    alertTypes: {
      usageLimit: boolean;
      costThreshold: boolean;
      rateLimit: boolean;
      errorRate: boolean;
    };
    phoneNumber?: string; // For SMS notifications
  };
}

export interface UserProfile extends Omit<User, 'password'> {
  // Public profile (no password)
  stats?: {
    promptsUsed: number;
    patternsCompleted: number;
    timeSaved: number; // hours
    level: number; // Gamification level
    xp: number;
  };
}

/**
 * Career skill categories
 */
export type SkillCategory = 
  | 'communication'
  | 'technical-leadership'
  | 'system-design'
  | 'architecture'
  | 'mentoring'
  | 'collaboration'
  | 'project-management'
  | 'code-quality';

export interface UserSkill {
  userId: string;
  skill: SkillCategory;
  count: number; // How many times used
  lastUsed: Date;
  improvement: number; // Percentage improvement
}
