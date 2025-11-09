#!/usr/bin/env node

/**
 * Engify MCP Server One-Time Authentication Script
 * 
 * This script handles the OAuth 2.1 flow for MCP server authentication.
 * Users run this once to authenticate their local MCP server.
 * 
 * Flow:
 * 1. Generate PKCE code verifier and challenge
 * 2. Start local HTTP server on random port
 * 3. Open browser to engify.ai OAuth endpoint
 * 4. Handle redirect with authorization code
 * 5. Exchange code for tokens
 * 6. Store refresh token in OS keychain
 */

import { createServer } from 'http';
import { URL } from 'url';
import { randomBytes } from 'crypto';
import { createHash } from 'crypto';
import { promisify } from 'util';
import { exec } from 'child_process';
import open from 'open';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import * as keychain from 'keychain';

const execAsync = promisify(exec);

// Configuration
const CLIENT_ID = 'engify-mcp-client';
const AUTH_SERVER = 'https://engify.ai';
const RESOURCE = 'urn:mcp:bug-reporter';
const KEYCHAIN_SERVICE = 'engify-mcp-server';
const KEYCHAIN_ACCOUNT = 'refresh-token';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  resource: string;
}

class MCPAuthenticator {
  private codeVerifier: string;
  private codeChallenge: string;
  private state: string;
  private localPort: number;
  private redirectUri: string;

  constructor() {
    this.codeVerifier = this.generateCodeVerifier();
    this.codeChallenge = this.generateCodeChallenge(this.codeVerifier);
    this.state = randomBytes(16).toString('hex');
    this.localPort = this.getRandomPort();
    this.redirectUri = `http://localhost:${this.localPort}`;
  }

  /**
   * Generate PKCE code verifier (OAuth 2.1 requirement)
   */
  private generateCodeVerifier(): string {
    return randomBytes(32).toString('base64url');
  }

  /**
   * Generate PKCE code challenge from verifier
   */
  private generateCodeChallenge(verifier: string): string {
    return createHash('sha256').update(verifier).digest('base64url');
  }

  /**
   * Get random port for local callback server
   */
  private getRandomPort(): number {
    return Math.floor(Math.random() * (65535 - 49152)) + 49152; // Dynamic port range
  }

  /**
   * Build OAuth authorization URL
   */
  private buildAuthUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: this.redirectUri,
      code_challenge: this.codeChallenge,
      code_challenge_method: 'S256',
      state: this.state,
      resource: RESOURCE, // RFC 8707 Resource Indicator
    });

    return `${AUTH_SERVER}/api/mcp-auth/authorize?${params}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  private async exchangeCodeForTokens(code: string): Promise<TokenResponse> {
    const spinner = ora('Exchanging authorization code for tokens...').start();

    try {
      const formData = new FormData();
      formData.append('grant_type', 'authorization_code');
      formData.append('code', code);
      formData.append('redirect_uri', this.redirectUri);
      formData.append('client_id', CLIENT_ID);
      formData.append('code_verifier', this.codeVerifier);

      const response = await fetch(`${AUTH_SERVER}/api/mcp-auth/token`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
      }

      const tokens = await response.json() as TokenResponse;
      spinner.succeed('Tokens received successfully');
      return tokens;

    } catch (error) {
      spinner.fail('Token exchange failed');
      throw error;
    }
  }

  /**
   * Store refresh token in OS keychain
   */
  private async storeRefreshToken(refreshToken: string): Promise<void> {
    const spinner = ora('Storing refresh token in secure keychain...').start();

    try {
      await new Promise<void>((resolve, reject) => {
        keychain.setPassword({
          service: KEYCHAIN_SERVICE,
          account: KEYCHAIN_ACCOUNT,
          password: refreshToken,
        }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      spinner.succeed('Refresh token stored securely');
    } catch (error) {
      spinner.fail('Failed to store refresh token');
      throw error;
    }
  }

  /**
   * Start local HTTP server to handle OAuth callback
   */
  private async startCallbackServer(): Promise<string> {
    return new Promise((resolve, reject) => {
      const server = createServer((req, res) => {
        const url = new URL(req.url!, `http://localhost:${this.localPort}`);
        
        // Handle OAuth callback
        if (url.pathname === '/') {
          const code = url.searchParams.get('code');
          const state = url.searchParams.get('state');
          const error = url.searchParams.get('error');

          if (error) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(`
              <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h2 style="color: red;">Authentication Failed</h2>
                  <p>Error: ${error}</p>
                  <p>You can close this window and try again.</p>
                </body>
              </html>
            `);
            reject(new Error(`OAuth error: ${error}`));
            return;
          }

          if (!code || !state) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(`
              <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h2 style="color: red;">Invalid Callback</h2>
                  <p>Missing required parameters.</p>
                </body>
              </html>
            `);
            reject(new Error('Invalid OAuth callback'));
            return;
          }

          // Validate state to prevent CSRF
          if (state !== this.state) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(`
              <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h2 style="color: red;">Security Error</h2>
                  <p>Invalid state parameter. Possible CSRF attack.</p>
                </body>
              </html>
            `);
            reject(new Error('Invalid state parameter'));
            return;
          }

          // Success - show success page
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h2 style="color: green;">Authentication Successful!</h2>
                <p>Your MCP server is now authenticated.</p>
                <p>You can close this window and return to your terminal.</p>
              </body>
            </html>
          `);

          resolve(code);
          server.close();
        }
      });

      server.listen(this.localPort, () => {
        console.log(chalk.blue(`🌐 Callback server listening on port ${this.localPort}`));
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        server.close();
        reject(new Error('Authentication timeout'));
      }, 300000);
    });
  }

  /**
   * Run the complete authentication flow
   */
  async authenticate(): Promise<void> {
    console.log(chalk.bold.blue('\n🔐 Engify MCP Server Authentication'));
    console.log(chalk.gray('This will authenticate your local MCP server with Engify.\n'));

    // Check if already authenticated
    try {
      const existingToken = await this.getStoredRefreshToken();
      if (existingToken) {
        const { confirm } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirm',
          message: 'Found existing authentication. Do you want to re-authenticate?',
          default: false,
        }]);

        if (!confirm) {
          console.log(chalk.green('✅ Using existing authentication'));
          return;
        }
      }
    } catch {
      // No existing token, continue
    }

    try {
      // Start callback server
      const authCodePromise = this.startCallbackServer();

      // Open browser
      const authUrl = this.buildAuthUrl();
      console.log(chalk.cyan('🌐 Opening browser for authentication...'));
      console.log(chalk.gray(`If browser doesn't open, visit: ${authUrl}\n`));
      
      await open(authUrl);

      // Wait for callback
      const authCode = await authCodePromise;

      // Exchange code for tokens
      const tokens = await this.exchangeCodeForTokens(authCode);

      // Store refresh token
      await this.storeRefreshToken(tokens.refresh_token);

      console.log(chalk.green.bold('\n✅ Authentication complete!'));
      console.log(chalk.gray('Your MCP server is now ready to use.'));
      console.log(chalk.gray('The refresh token is stored securely in your OS keychain.\n'));

    } catch (error) {
      console.error(chalk.red.bold('\n❌ Authentication failed:'), error);
      process.exit(1);
    }
  }

  /**
   * Get stored refresh token from keychain
   */
  private async getStoredRefreshToken(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      keychain.getPassword({
        service: KEYCHAIN_SERVICE,
        account: KEYCHAIN_ACCOUNT,
      }, (err, password) => {
        if (err) reject(err);
        else resolve(password || null);
      });
    });
  }
}

// Run authentication if called directly
if (require.main === module) {
  const authenticator = new MCPAuthenticator();
  authenticator.authenticate().catch(console.error);
}

export { MCPAuthenticator };
