/**
 * User-Facing Messages
 * 
 * Consolidates all user-facing strings into a single source of truth.
 * Makes it easy to update messaging and maintain consistency across the app.
 * Also enables future internationalization (i18n) if needed.
 */

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  // Authentication
  AUTH_REQUIRED: 'Please sign in to continue.',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Your account has been temporarily locked due to too many failed login attempts.',
  
  // Authorization
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  ADMIN_ONLY: 'This action requires administrator privileges.',
  SUBSCRIPTION_REQUIRED: 'Please upgrade your plan to access this feature.',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later or upgrade your plan for higher limits.',
  DAILY_LIMIT_REACHED: 'You have reached your daily limit. Please try again tomorrow or upgrade your plan.',
  COST_LIMIT_EXCEEDED: 'Your cost limit has been reached. Please upgrade your plan to continue.',
  
  // Validation
  INVALID_INPUT: 'Invalid input provided. Please check your data and try again.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
  CONTENT_TOO_LONG: 'Content exceeds maximum length.',
  CONTENT_TOO_SHORT: 'Content does not meet minimum length.',
  
  // Data Operations
  FETCH_FAILED: 'Failed to load data. Please try again.',
  SAVE_FAILED: 'Failed to save. Please try again.',
  DELETE_FAILED: 'Failed to delete. Please try again.',
  UPDATE_FAILED: 'Failed to update. Please try again.',
  
  // Resources
  NOT_FOUND: 'The requested resource was not found.',
  PROMPT_NOT_FOUND: 'Prompt not found.',
  PATTERN_NOT_FOUND: 'Pattern not found.',
  USER_NOT_FOUND: 'User not found.',
  
  // Network
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  
  // File Upload
  FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported format.',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  
  // AI Operations
  AI_REQUEST_FAILED: 'AI request failed. Please try again.',
  MODEL_UNAVAILABLE: 'The selected AI model is currently unavailable.',
  PROMPT_TOO_LONG: 'Your prompt is too long. Please shorten it and try again.',
  
  // Generic
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  MAINTENANCE_MODE: 'The system is currently undergoing maintenance. Please try again later.',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  // Data Operations
  SAVED: 'Saved successfully!',
  DELETED: 'Deleted successfully!',
  UPDATED: 'Updated successfully!',
  CREATED: 'Created successfully!',
  
  // Clipboard
  COPIED: 'Copied to clipboard!',
  
  // Favorites
  ADDED_TO_FAVORITES: 'Added to favorites!',
  REMOVED_FROM_FAVORITES: 'Removed from favorites.',
  
  // Sharing
  SHARED: 'Shared successfully!',
  LINK_COPIED: 'Link copied to clipboard!',
  
  // Profile
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  EMAIL_VERIFIED: 'Email verified successfully!',
  
  // Authentication
  SIGNED_IN: 'Welcome back!',
  SIGNED_OUT: 'Signed out successfully.',
  SIGNED_UP: 'Account created successfully!',
  
  // Feedback
  FEEDBACK_SUBMITTED: 'Thank you for your feedback!',
  RATING_SUBMITTED: 'Rating submitted successfully!',
  
  // Subscriptions
  SUBSCRIPTION_UPDATED: 'Subscription updated successfully!',
  PLAN_UPGRADED: 'Plan upgraded successfully!',
  
  // Generic
  CHANGES_SAVED: 'Your changes have been saved.',
  REQUEST_SENT: 'Request sent successfully!',
} as const;

/**
 * Information Messages
 */
export const INFO_MESSAGES = {
  // Loading States
  LOADING: 'Loading...',
  PROCESSING: 'Processing...',
  SAVING: 'Saving...',
  DELETING: 'Deleting...',
  GENERATING: 'Generating...',
  
  // Empty States
  NO_RESULTS: 'No results found.',
  NO_PROMPTS: 'No prompts yet.',
  NO_FAVORITES: 'No favorites yet.',
  NO_ACTIVITY: 'No recent activity.',
  NO_ACHIEVEMENTS: 'No achievements unlocked yet.',
  
  // Guidance
  SIGN_IN_TO_SAVE: 'Sign in to save your favorites across devices.',
  UPGRADE_FOR_MORE: 'Upgrade your plan for higher limits and more features.',
  BETA_ACCESS: 'You have beta access to this feature.',
  
  // Confirmations
  CONFIRM_DELETE: 'Are you sure you want to delete this?',
  CONFIRM_LOGOUT: 'Are you sure you want to sign out?',
  UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
} as const;

/**
 * Call-to-Action Messages
 */
export const CTA_MESSAGES = {
  // Authentication
  SIGN_IN: 'Sign In',
  SIGN_UP: 'Sign Up',
  SIGN_OUT: 'Sign Out',
  
  // Actions
  SAVE: 'Save',
  CANCEL: 'Cancel',
  DELETE: 'Delete',
  EDIT: 'Edit',
  CREATE: 'Create',
  UPDATE: 'Update',
  SUBMIT: 'Submit',
  CONTINUE: 'Continue',
  BACK: 'Back',
  NEXT: 'Next',
  DONE: 'Done',
  
  // Content
  VIEW_DETAILS: 'View Details',
  VIEW_ALL: 'View All',
  LOAD_MORE: 'Load More',
  SHOW_MORE: 'Show More',
  SHOW_LESS: 'Show Less',
  
  // Favorites
  ADD_TO_FAVORITES: 'Add to Favorites',
  REMOVE_FROM_FAVORITES: 'Remove from Favorites',
  
  // Sharing
  SHARE: 'Share',
  COPY_LINK: 'Copy Link',
  
  // Subscriptions
  UPGRADE: 'Upgrade',
  UPGRADE_PLAN: 'Upgrade Plan',
  VIEW_PLANS: 'View Plans',
  
  // Help
  LEARN_MORE: 'Learn More',
  GET_HELP: 'Get Help',
  CONTACT_SUPPORT: 'Contact Support',
  
  // Filters
  APPLY_FILTERS: 'Apply Filters',
  CLEAR_FILTERS: 'Clear Filters',
  RESET: 'Reset',
  
  // Try Again
  TRY_AGAIN: 'Try Again',
  RETRY: 'Retry',
  REFRESH: 'Refresh',
} as const;

/**
 * Feature Tour Messages
 */
export const TOUR_MESSAGES = {
  WELCOME: 'Welcome to Engify! Let us show you around.',
  PROMPTS: 'Browse our library of expert-crafted prompts.',
  PATTERNS: 'Learn proven prompt patterns and frameworks.',
  WORKBENCH: 'Test and refine your prompts with AI.',
  FAVORITES: 'Save your favorite prompts for quick access.',
  SKIP: 'Skip Tour',
  FINISH: 'Finish Tour',
} as const;

/**
 * Email Messages (for email templates)
 */
export const EMAIL_MESSAGES = {
  WELCOME_SUBJECT: 'Welcome to Engify!',
  WELCOME_BODY: 'We\'re excited to have you on board.',
  
  VERIFY_EMAIL_SUBJECT: 'Verify your email address',
  VERIFY_EMAIL_BODY: 'Please verify your email address to continue.',
  
  PASSWORD_RESET_SUBJECT: 'Reset your password',
  PASSWORD_RESET_BODY: 'Click the link below to reset your password.',
  
  WEEKLY_DIGEST_SUBJECT: 'Your weekly Engify digest',
  MONTHLY_REPORT_SUBJECT: 'Your monthly usage report',
} as const;

/**
 * Achievement Messages
 */
export const ACHIEVEMENT_MESSAGES = {
  WELCOME_ABOARD: {
    title: 'Welcome Aboard!',
    description: 'Completed your first login.',
  },
  FIRST_PROMPT: {
    title: 'Prompt Explorer',
    description: 'Used your first prompt.',
  },
  PROMPT_COLLECTOR: {
    title: 'Prompt Collector',
    description: 'Favorited 10 prompts.',
  },
  STREAK_WEEK: {
    title: 'Week Warrior',
    description: 'Maintained a 7-day streak.',
  },
  STREAK_MONTH: {
    title: 'Monthly Master',
    description: 'Maintained a 30-day streak.',
  },
  POWER_USER: {
    title: 'Power User',
    description: 'Used 100 prompts.',
  },
} as const;

/**
 * Helper function to get error message with context
 */
export function getErrorMessage(key: keyof typeof ERROR_MESSAGES, context?: string): string {
  const message = ERROR_MESSAGES[key];
  return context ? `${message} ${context}` : message;
}

/**
 * Helper function to format rate limit message with time
 */
export function getRateLimitMessage(resetAt: Date): string {
  const minutes = Math.ceil((resetAt.getTime() - Date.now()) / 60000);
  if (minutes <= 1) {
    return `${ERROR_MESSAGES.RATE_LIMIT_EXCEEDED} Try again in a moment.`;
  }
  return `${ERROR_MESSAGES.RATE_LIMIT_EXCEEDED} Try again in ${minutes} minutes.`;
}

