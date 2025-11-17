/**
 * SendGrid Dynamic Template Manager
 *
 * Manages template IDs and provides type-safe template data builders
 */

export interface TemplateData {
  [key: string]:
    | string
    | number
    | boolean
    | TemplateData
    | TemplateData[]
    | undefined;
}

/**
 * Template IDs from SendGrid Dashboard
 * These should match the template IDs you create in SendGrid
 */
export const SENDGRID_TEMPLATES = {
  WELCOME: process.env.SENDGRID_WELCOME_TEMPLATE_ID || 'd-welcome-template-id',
  PASSWORD_RESET:
    process.env.SENDGRID_PASSWORD_RESET_TEMPLATE_ID ||
    'd-password-reset-template-id',
  EMAIL_VERIFICATION:
    process.env.SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID ||
    'd-email-verification-template-id',
  PROMPT_SHARED:
    process.env.SENDGRID_PROMPT_SHARED_TEMPLATE_ID ||
    'd-prompt-shared-template-id',
  CONTACT_FORM:
    process.env.SENDGRID_CONTACT_FORM_TEMPLATE_ID ||
    'd-contact-form-template-id',
  API_KEY_ALERT:
    process.env.SENDGRID_API_KEY_ALERT_TEMPLATE_ID ||
    'd-api-key-alert-template-id',
  WEEKLY_DIGEST:
    process.env.SENDGRID_WEEKLY_DIGEST_TEMPLATE_ID ||
    'd-weekly-digest-template-id',
  AI_CONTENT_READY:
    process.env.SENDGRID_AI_CONTENT_READY_TEMPLATE_ID ||
    'd-ai-content-ready-template-id',
} as const;

/**
 * Welcome Email Template Data
 */
export interface WelcomeTemplateData extends TemplateData {
  userName: string;
  userEmail: string;
  loginUrl: string;
  libraryUrl: string;
  workbenchUrl: string;
  supportUrl: string;
}

/**
 * Password Reset Template Data
 */
export interface PasswordResetTemplateData extends TemplateData {
  userName: string;
  resetUrl: string;
  expirationMinutes: number;
  supportUrl: string;
}

/**
 * Email Verification Template Data
 */
export interface EmailVerificationTemplateData extends TemplateData {
  userName: string;
  verificationUrl: string;
  expirationMinutes: number;
}

/**
 * Prompt Shared Template Data
 */
export interface PromptSharedTemplateData extends TemplateData {
  senderName: string;
  senderEmail: string;
  recipientName?: string;
  promptTitle: string;
  promptContent: string;
  promptUrl: string;
  engifyUrl: string;
}

/**
 * Contact Form Template Data
 */
export interface ContactFormTemplateData extends TemplateData {
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  timestamp: string;
  replyTo: string;
}

/**
 * API Key Alert Template Data
 */
export interface ApiKeyAlertTemplateData extends TemplateData {
  userName: string;
  keyName: string;
  provider: string;
  metric: 'tokens' | 'cost' | 'requests';
  currentValue: number;
  threshold: number;
  period: 'daily' | 'weekly' | 'monthly';
  dashboardUrl: string;
  percentage?: number; // Percentage of quota used
  thresholdLevel?: 50 | 80 | 90 | 100; // Which threshold was reached
  quota?: number; // Total quota/limit
  recommendedAction?: string; // Suggested action for user
}

/**
 * Weekly Digest Template Data
 */
export interface WeeklyDigestTemplateData extends TemplateData {
  userName: string;
  weekStart: string;
  weekEnd: string;
  totalPromptsUsed: number;
  totalTokensUsed: number;
  totalCost: number;
  topPrompts: Array<{
    title: string;
    uses: number;
    url: string;
  }>;
  topPatterns: Array<{
    name: string;
    uses: number;
  }>;
  libraryUrl: string;
  analyticsUrl: string;
}

/**
 * AI Content Ready Template Data
 */
export interface AIContentReadyTemplateData extends TemplateData {
  userName: string;
  contentType: string; // e.g., "OKR", "Retrospective", "Tech Debt Analysis"
  contentTitle: string;
  contentUrl: string;
  generatedAt: string;
}

/**
 * Template data builders - ensures type safety and required fields
 */
export const SendGridTemplateBuilders = {
  welcome: (
    data: WelcomeTemplateData
  ): { templateId: string; dynamicTemplateData: WelcomeTemplateData } => ({
    templateId: SENDGRID_TEMPLATES.WELCOME,
    dynamicTemplateData: data,
  }),

  passwordReset: (
    data: PasswordResetTemplateData
  ): {
    templateId: string;
    dynamicTemplateData: PasswordResetTemplateData;
  } => ({
    templateId: SENDGRID_TEMPLATES.PASSWORD_RESET,
    dynamicTemplateData: data,
  }),

  emailVerification: (
    data: EmailVerificationTemplateData
  ): {
    templateId: string;
    dynamicTemplateData: EmailVerificationTemplateData;
  } => ({
    templateId: SENDGRID_TEMPLATES.EMAIL_VERIFICATION,
    dynamicTemplateData: data,
  }),

  promptShared: (
    data: PromptSharedTemplateData
  ): { templateId: string; dynamicTemplateData: PromptSharedTemplateData } => ({
    templateId: SENDGRID_TEMPLATES.PROMPT_SHARED,
    dynamicTemplateData: data,
  }),

  contactForm: (
    data: ContactFormTemplateData
  ): { templateId: string; dynamicTemplateData: ContactFormTemplateData } => ({
    templateId: SENDGRID_TEMPLATES.CONTACT_FORM,
    dynamicTemplateData: data,
  }),

  apiKeyAlert: (
    data: ApiKeyAlertTemplateData
  ): { templateId: string; dynamicTemplateData: ApiKeyAlertTemplateData } => ({
    templateId: SENDGRID_TEMPLATES.API_KEY_ALERT,
    dynamicTemplateData: data,
  }),

  weeklyDigest: (
    data: WeeklyDigestTemplateData
  ): { templateId: string; dynamicTemplateData: WeeklyDigestTemplateData } => ({
    templateId: SENDGRID_TEMPLATES.WEEKLY_DIGEST,
    dynamicTemplateData: data,
  }),

  aiContentReady: (
    data: AIContentReadyTemplateData
  ): {
    templateId: string;
    dynamicTemplateData: AIContentReadyTemplateData;
  } => ({
    templateId: SENDGRID_TEMPLATES.AI_CONTENT_READY,
    dynamicTemplateData: data,
  }),
};
