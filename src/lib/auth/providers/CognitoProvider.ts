/**
 * AWS Cognito Provider for NextAuth.js
 *
 * Enterprise-grade authentication using AWS Cognito.
 * Replaces MongoDB-based auth for better scalability and reliability.
 */

import CredentialsProvider from 'next-auth/providers/credentials';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GetUserCommand,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { z } from 'zod';
import { createHmac } from 'crypto';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Define Cognito configuration constants FIRST
const COGNITO_REGION = process.env.COGNITO_REGION || 'us-east-1';
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET; // Optional, only if using client secret

// Initialize Cognito client AFTER constants are defined (only if env vars are set)
const cognitoClient =
  COGNITO_CLIENT_ID && COGNITO_USER_POOL_ID
    ? new CognitoIdentityProviderClient({
        region: COGNITO_REGION,
      })
    : null;

// Construct Cognito issuer URL (only if configured)
const COGNITO_ISSUER = COGNITO_USER_POOL_ID
  ? `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`
  : '';

/**
 * Generate SECRET_HASH for Cognito authentication
 * Required when App Client has a client secret configured
 * Formula: HMAC-SHA256(USERNAME + CLIENT_ID, CLIENT_SECRET) encoded as base64
 */
function generateSecretHash(username: string): string {
  if (!COGNITO_CLIENT_SECRET || !COGNITO_CLIENT_ID) {
    throw new Error('Client secret and client ID are required for SECRET_HASH');
  }

  const hmac = createHmac('sha256', COGNITO_CLIENT_SECRET);
  hmac.update(username + COGNITO_CLIENT_ID);
  return hmac.digest('base64');
}

/**
 * AWS Cognito Credentials Provider
 */
export function CognitoProvider() {
  return CredentialsProvider({
    name: 'cognito',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      try {
        // Validate Cognito is configured
        if (!COGNITO_CLIENT_ID || !COGNITO_USER_POOL_ID || !cognitoClient) {
          throw new Error(
            'Cognito is not configured. Set COGNITO_CLIENT_ID and COGNITO_USER_POOL_ID environment variables.'
          );
        }

        // Validate input
        const { email, password } = loginSchema.parse(credentials);

        // Authenticate with Cognito
        const authParams: Record<string, string> = {
          USERNAME: email,
          PASSWORD: password,
        };

        // Generate SECRET_HASH if client secret is configured
        // Cognito requires SECRET_HASH for App Clients with secrets
        if (COGNITO_CLIENT_SECRET) {
          try {
            authParams.SECRET_HASH = generateSecretHash(email);
          } catch (error) {
            console.error('Failed to generate SECRET_HASH:', error);
            throw new Error('Cognito client secret configuration error');
          }
        }

        const authCommand = new InitiateAuthCommand({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: COGNITO_CLIENT_ID,
          AuthParameters: authParams,
        });

        const authResponse = await cognitoClient.send(authCommand);

        if (!authResponse.AuthenticationResult) {
          return null;
        }

        // Get user attributes from Cognito
        const getUserCommand = new GetUserCommand({
          AccessToken: authResponse.AuthenticationResult.AccessToken,
        });

        const userResponse = await cognitoClient.send(getUserCommand);

        if (!userResponse.Username) {
          return null;
        }

        // Extract user attributes
        const attributes = userResponse.UserAttributes || [];
        const emailAttr =
          attributes.find((attr) => attr.Name === 'email')?.Value || email;
        const nameAttr =
          attributes.find((attr) => attr.Name === 'name')?.Value || '';
        const emailVerifiedAttr =
          attributes.find((attr) => attr.Name === 'email_verified')?.Value ===
          'true';
        const roleAttr =
          attributes.find((attr) => attr.Name === 'custom:role')?.Value ||
          'user';
        const organizationIdAttr =
          attributes.find((attr) => attr.Name === 'custom:organizationId')
            ?.Value || null;

        return {
          id: userResponse.Username,
          email: emailAttr,
          name: nameAttr,
          role: roleAttr,
          organizationId: organizationIdAttr,
          emailVerified: emailVerifiedAttr ? new Date() : null,
        };
      } catch (error) {
        console.error('Cognito auth error:', error);
        return null;
      }
    },
  });
}

/**
 * Admin function to get user by email (for migrations)
 */
export async function getCognitoUserByEmail(email: string) {
  try {
    if (!COGNITO_USER_POOL_ID || !cognitoClient) {
      throw new Error('Cognito is not configured');
    }

    const command = new AdminGetUserCommand({
      UserPoolId: COGNITO_USER_POOL_ID,
      Username: email,
    });

    const response = await cognitoClient.send(command);
    return response;
  } catch (error) {
    console.error('Error getting Cognito user:', error);
    return null;
  }
}

// Export Cognito configuration for reference
export const cognitoConfig = {
  issuer: COGNITO_ISSUER,
  clientId: COGNITO_CLIENT_ID,
  userPoolId: COGNITO_USER_POOL_ID,
  region: COGNITO_REGION,
  callbackUrl: process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/auth/callback/cognito`
    : 'https://engify.ai/api/auth/callback/cognito',
};
