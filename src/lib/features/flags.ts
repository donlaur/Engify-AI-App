/**
 * Feature Flags - Simple boolean toggles
 * 
 * Change these to enable/disable features
 * No vendor needed for MVP
 */

// MVP Phase 1 - ENABLED
export const PROMPT_LIBRARY = true;
export const USER_PROFILES = true;
export const FAVORITES = true;
export const RATINGS = true;

// Phase 2 - DISABLED (not ready)
export const AI_EXECUTION = false;
export const LEARNING_PATHWAYS = false;
export const TEAM_WORKSPACE = false;
export const ADMIN_DASHBOARD = false;

// Helper for conditional rendering
export const features = {
  promptLibrary: PROMPT_LIBRARY,
  userProfiles: USER_PROFILES,
  favorites: FAVORITES,
  ratings: RATINGS,
  aiExecution: AI_EXECUTION,
  learningPathways: LEARNING_PATHWAYS,
  teamWorkspace: TEAM_WORKSPACE,
  adminDashboard: ADMIN_DASHBOARD,
} as const;
