/**
 * AI Summary: Typed template registry for SendGrid with Zod-validated merge data.
 */
import { z } from 'zod';

export const TemplateId = {
  WELCOME: 'SENDGRID_WELCOME_TEMPLATE_ID',
  PASSWORD_RESET: 'SENDGRID_PASSWORD_RESET_TEMPLATE_ID',
} as const;

const WelcomeVars = z.object({ name: z.string().min(1) });
const PasswordResetVars = z.object({ resetUrl: z.string().url() });

export type WelcomeVars = z.infer<typeof WelcomeVars>;
export type PasswordResetVars = z.infer<typeof PasswordResetVars>;

export function getTemplateId(
  envKey: keyof typeof TemplateId | string
): string | null {
  const key = typeof envKey === 'string' ? envKey : TemplateId[envKey];
  return process.env[key] ?? null;
}

export const TemplateRegistry = {
  welcome: {
    envKey: TemplateId.WELCOME,
    schema: WelcomeVars,
  },
  passwordReset: {
    envKey: TemplateId.PASSWORD_RESET,
    schema: PasswordResetVars,
  },
};
