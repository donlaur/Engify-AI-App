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

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_REGION,
});

const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET; // Optional, only if using client secret
const COGNITO_REGION = process.env.COGNITO_REGION || 'us-east-1';

if (!COGNITO_CLIENT_ID) {
  throw new Error('COGNITO_CLIENT_ID environment variable is required');
}

if (!COGNITO_USER_POOL_ID) {
  throw new Error('COGNITO_USER_POOL_ID environment variable is required');
}

// Construct Cognito issuer URL
const COGNITO_ISSUER = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`;

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
        // Validate input
        const { email, password } = loginSchema.parse(credentials);

        // Authenticate with Cognito
        const authParams: Record<string, string> = {
          USERNAME: email,
          PASSWORD: password,
        };

        // Add client secret if using one (some app clients require it)
        if (COGNITO_CLIENT_SECRET) {
          // Note: Cognito requires SECRET_HASH for clients with secrets
          // For now, we'll use USER_PASSWORD_AUTH which doesn't require secret hash
          // If you need client secret, you'll need to generate SECRET_HASH
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
