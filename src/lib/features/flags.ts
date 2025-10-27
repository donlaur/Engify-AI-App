/**
 * Feature Flags
 */

export type FeatureFlag =
  | 'enable_prompt_library'
  | 'enable_learning_pathways'
  | 'enable_basic_workbench'
  | 'enable_user_profiles'
  | 'enable_favorites'
  | 'enable_ratings'
  | 'enable_ai_execution'
  | 'enable_team_workspace'
  | 'enable_admin_dashboard';

const featureFlags: Record<string, Record<FeatureFlag, boolean>> = {
  development: {
    enable_prompt_library: true,
    enable_learning_pathways: true,
    enable_basic_workbench: true,
    enable_user_profiles: true,
    enable_favorites: true,
    enable_ratings: true,
    enable_ai_execution: false,
    enable_team_workspace: false,
    enable_admin_dashboard: false,
  },
  production: {
    enable_prompt_library: true,
    enable_learning_pathways: true,
    enable_basic_workbench: true,
    enable_user_profiles: true,
    enable_favorites: true,
    enable_ratings: true,
    enable_ai_execution: false,
    enable_team_workspace: false,
    enable_admin_dashboard: false,
  },
};

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const env = process.env.NODE_ENV || 'development';
  return featureFlags[env]?.[flag] ?? false;
}

export function getEnabledFeatures(): FeatureFlag[] {
  const env = process.env.NODE_ENV || 'development';
  const flags = featureFlags[env] || {};
  return (Object.keys(flags) as FeatureFlag[]).filter((flag) => flags[flag]);
}
