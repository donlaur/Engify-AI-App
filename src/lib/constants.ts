/**
 * Application constants
 */

export const APP_NAME = 'Engify.ai';
export const APP_DESCRIPTION = 'From AI Fear to AI Fluency';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

export const SOCIAL_LINKS = {
  github: 'https://github.com/donlaur/Engify-AI-App',
  linkedin: 'https://linkedin.com/in/donlaur',
  twitter: 'https://twitter.com/donlaur',
};

export const CONTACT_EMAIL = 'donlaur@gmail.com';

export const ROUTES = {
  home: '/',
  library: '/library',
  patterns: '/patterns',
  learn: '/learn',
  blog: '/blog',
  pricing: '/pricing',
  about: '/about',
  contact: '/contact',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  workbench: '/workbench',
  settings: '/settings',
} as const;

export const ROLE_ROUTES = {
  cLevel: '/for-c-level',
  directors: '/for-directors',
  managers: '/for-managers',
  engineers: '/for-engineers',
  designers: '/for-designers',
  pms: '/for-pms',
  qa: '/for-qa',
} as const;

export const API_ROUTES = {
  health: '/api/health',
  auth: '/api/auth',
  prompts: '/api/prompts',
  ai: '/api/ai/execute',
  analytics: '/api/analytics/track',
} as const;

export const LIMITS = {
  maxPromptLength: 5000,
  maxTitleLength: 100,
  maxDescriptionLength: 500,
  maxTagsPerPrompt: 10,
  maxFavoritesPerUser: 100,
  maxHistoryPerUser: 1000,
} as const;

// Calculate total prompts dynamically
const calculateTotalPrompts = () => {
  // TODO: Get from database
  return 150;
};

export const SITE_STATS = {
  totalPrompts: calculateTotalPrompts(),
  totalPatterns: 15,
  totalUsers: '1K+',
  avgTimeSaved: '2hrs',
};

export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

export const CACHE_TTL = {
  prompts: 60 * 5, // 5 minutes
  patterns: 60 * 60, // 1 hour
  user: 60 * 15, // 15 minutes
} as const;
