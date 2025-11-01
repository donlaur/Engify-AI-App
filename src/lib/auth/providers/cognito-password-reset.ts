/**
 * Cognito Password Reset Helper
 *
 * Uses AWS SDK to reset passwords via Cognito Admin APIs
 */

import {
  CognitoIdentityProviderClient,
  AdminResetUserPasswordCommand,
  AdminSetUserPasswordCommand,
  ForgotPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const COGNITO_REGION = process.env.COGNITO_REGION || 'us-east-1';
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

const cognitoClient =
  COGNITO_CLIENT_ID && COGNITO_USER_POOL_ID
    ? new CognitoIdentityProviderClient({
        region: COGNITO_REGION,
      })
    : null;

/**
 * Request password reset via Cognito (sends email)
 */
export async function cognitoForgotPassword(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  if (!COGNITO_CLIENT_ID || !cognitoClient) {
    return {
      success: false,
      error: 'Cognito is not configured',
    };
  }

  try {
    const command = new ForgotPasswordCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: email,
    });

    await cognitoClient.send(command);

    return {
      success: true,
      message: 'Password reset code sent to your email',
    };
  } catch (error) {
    console.error('Cognito forgot password error:', error);

    // Don't reveal if user exists
    return {
      success: true,
      message: 'If an account exists, a password reset code has been sent.',
    };
  }
}

/**
 * Admin reset user password (generates temporary password)
 * Requires admin permissions
 */
export async function cognitoAdminResetPassword(email: string): Promise<{
  success: boolean;
  temporaryPassword?: string;
  error?: string;
}> {
  if (!COGNITO_USER_POOL_ID || !cognitoClient) {
    return {
      success: false,
      error: 'Cognito is not configured',
    };
  }

  try {
    const command = new AdminResetUserPasswordCommand({
      UserPoolId: COGNITO_USER_POOL_ID,
      Username: email,
    });

    await cognitoClient.send(command);

    // Note: AdminResetUserPasswordCommand doesn't return the temporary password
    // It sends it via email. Use AdminSetUserPasswordCommand if you need to set it directly.
    return {
      success: true,
      message: 'Password reset code sent to your email',
    };
  } catch (error) {
    console.error('Cognito admin reset password error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to reset password',
    };
  }
}

/**
 * Admin set user password directly (requires admin permissions)
 */
export async function cognitoAdminSetPassword(
  email: string,
  password: string,
  permanent: boolean = true
): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!COGNITO_USER_POOL_ID || !cognitoClient) {
    return {
      success: false,
      error: 'Cognito is not configured',
    };
  }

  try {
    const command = new AdminSetUserPasswordCommand({
      UserPoolId: COGNITO_USER_POOL_ID,
      Username: email,
      Password: password,
      Permanent: permanent,
    });

    await cognitoClient.send(command);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Cognito admin set password error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set password',
    };
  }
}
