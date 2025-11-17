/**
 * AI Summary: Typed template registry for SendGrid with Zod-validated merge data.
 */
import { z } from 'zod';

export const TemplateId = {
  WELCOME: 'SENDGRID_WELCOME_TEMPLATE_ID',
  PASSWORD_RESET: 'SENDGRID_PASSWORD_RESET_TEMPLATE_ID',
  EMAIL_VERIFICATION: 'SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID',
  API_KEY_ALERT: 'SENDGRID_API_KEY_ALERT_TEMPLATE_ID',
} as const;

const WelcomeSchema = z.object({
  userName: z.string().min(1),
  userEmail: z.string().email(),
  loginUrl: z.string().url(),
  libraryUrl: z.string().url(),
  workbenchUrl: z.string().url(),
  supportUrl: z.string().url(),
});

const PasswordResetSchema = z.object({
  userName: z.string().min(1),
  resetUrl: z.string().url(),
  expirationMinutes: z.number().int().positive(),
  supportUrl: z.string().url(),
});

const EmailVerificationSchema = z.object({
  userName: z.string().min(1),
  verificationUrl: z.string().url(),
  expirationMinutes: z.number().int().positive(),
});

const ApiKeyAlertSchema = z.object({
  userName: z.string().min(1),
  keyName: z.string().min(1),
  provider: z.string().min(1),
  metric: z.enum(['tokens', 'cost', 'requests']),
  currentValue: z.number().nonnegative(),
  threshold: z.number().positive(),
  period: z.enum(['daily', 'weekly', 'monthly']),
  dashboardUrl: z.string().url(),
  // Optional fields used in email template fallback
  percentage: z.number().optional(),
  thresholdLevel: z.number().optional(),
  quota: z.number().optional(),
  recommendedAction: z.string().optional(),
});

export type WelcomeVars = z.infer<typeof WelcomeSchema>;
export type PasswordResetVars = z.infer<typeof PasswordResetSchema>;
export type EmailVerificationVars = z.infer<typeof EmailVerificationSchema>;
export type ApiKeyAlertVars = z.infer<typeof ApiKeyAlertSchema>;
export type WelcomeTemplateData = WelcomeVars;
export type PasswordResetTemplateData = PasswordResetVars;
export type EmailVerificationTemplateData = EmailVerificationVars;
export type ApiKeyAlertTemplateData = ApiKeyAlertVars;

export const TemplateRegistry = {
  welcome: {
    envKey: TemplateId.WELCOME,
    schema: WelcomeSchema,
  },
  passwordReset: {
    envKey: TemplateId.PASSWORD_RESET,
    schema: PasswordResetSchema,
  },
  emailVerification: {
    envKey: TemplateId.EMAIL_VERIFICATION,
    schema: EmailVerificationSchema,
  },
  apiKeyAlert: {
    envKey: TemplateId.API_KEY_ALERT,
    schema: ApiKeyAlertSchema,
  },
} as const;

export type TemplateKey = keyof typeof TemplateRegistry;

export type TemplateInput<K extends TemplateKey> = z.infer<
  (typeof TemplateRegistry)[K]['schema']
>;

export function getTemplateId(
  envKey: keyof typeof TemplateId | string
): string | null {
  const key = typeof envKey === 'string' ? envKey : TemplateId[envKey];
  return process.env[key] ?? null;
}

export function prepareTemplate<K extends TemplateKey>(
  key: K,
  data: TemplateInput<K>
): { templateId: string; dynamicTemplateData: TemplateInput<K> } | null {
  const definition = TemplateRegistry[key];
  const templateId = getTemplateId(definition.envKey);
  if (!templateId) {
    return null;
  }
  const validated = definition.schema.parse(data);
  return {
    templateId,
    dynamicTemplateData: validated,
  };
}

export const SendGridTemplateBuilders = {
  welcome: (data: TemplateInput<'welcome'>) => prepareTemplate('welcome', data),
  passwordReset: (data: TemplateInput<'passwordReset'>) =>
    prepareTemplate('passwordReset', data),
  emailVerification: (data: TemplateInput<'emailVerification'>) =>
    prepareTemplate('emailVerification', data),
  apiKeyAlert: (data: TemplateInput<'apiKeyAlert'>) =>
    prepareTemplate('apiKeyAlert', data),
} as const;
