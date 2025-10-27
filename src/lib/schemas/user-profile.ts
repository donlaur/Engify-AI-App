/**
 * User Profile Schema
 * Extended user data for personalization
 */

import { z } from 'zod';

export const userProfileSchema = z.object({
  // Basic Info (from signup)
  name: z.string().min(1),
  email: z.string().email(),
  
  // Professional Context (onboarding)
  role: z.enum(['engineer', 'manager', 'designer', 'pm', 'qa', 'executive']),
  yearsExperience: z.enum(['0-2', '3-5', '6-10', '10+']),
  aiExperienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional(),
  industry: z.string().optional(),
  
  // Usage Data (auto-tracked)
  promptsExecuted: z.number().default(0),
  favoritePrompts: z.array(z.string()).default([]),
  patternsLearned: z.array(z.string()).default([]),
  totalTokensUsed: z.number().default(0),
  
  // Gamification
  level: z.number().default(1),
  xp: z.number().default(0),
  streak: z.number().default(0),
  lastActiveDate: z.date().optional(),
  
  // Preferences
  preferredAIProvider: z.enum(['openai', 'google', 'anthropic']).default('openai'),
  defaultTemperature: z.number().min(0).max(2).default(0.7),
  
  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
  onboardingCompleted: z.boolean().default(false),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export const onboardingSchema = z.object({
  role: z.enum(['engineer', 'manager', 'designer', 'pm', 'qa', 'executive']),
  yearsExperience: z.enum(['0-2', '3-5', '6-10', '10+']),
  aiExperienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional(),
  industry: z.string().optional(),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
