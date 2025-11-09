#!/usr/bin/env node

/**
 * Engify MCP Server Token Generator
 * 
 * Simplified approach: Generate MCP token from existing dashboard session.
 * 
 * Flow:
 * 1. Check if user has existing token
 * 2. If not, prompt user to visit dashboard to generate token
 * 3. Store token locally for MCP server use
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';
import inquirer from 'inquirer';

const CONFIG_FILE = join(homedir(), '.engify-mcp-auth.json');

interface AuthConfig {
  userId: string;
  accessToken: string;
  expiresAt: number;
  createdAt: number;
}

class TokenManager {
  private configPath: string;

  constructor() {
    this.configPath = CONFIG_FILE;
  }

  /**
   * Check if we have a valid token
   */
  private hasValidToken(): boolean {
    if (!existsSync(this.configPath)) {
      return false;
    }

    try {
      const config: AuthConfig = JSON.parse(readFileSync(this.configPath, 'utf8'));
      
      // Check if token is expired (1 hour expiry)
      const now = Date.now();
      if (now >= config.expiresAt) {
        console.log(chalk.yellow('⚠️  Token expired'));
        return false;
      }

      return true;
    } catch (error) {
      console.log(chalk.red('❌ Invalid token file'));
      return false;
    }
  }

  /**
   * Get existing token
   */
  private getToken(): AuthConfig | null {
    if (!existsSync(this.configPath)) {
      return null;
    }

    try {
      return JSON.parse(readFileSync(this.configPath, 'utf8'));
    } catch {
      return null;
    }
  }

  /**
   * Store token locally
   */
  private storeToken(config: AuthConfig): void {
    writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    console.log(chalk.green('✅ Token stored locally'));
  }

  /**
   * Generate new token (user needs to get from dashboard)
   */
  private async generateNewToken(): Promise<void> {
    console.log(chalk.bold.blue('\n🔐 Generate MCP Access Token'));
    console.log(chalk.gray('You need to generate a token from your Engify dashboard.\n'));

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'Ready to generate a new token?',
      default: true,
    }]);

    if (!confirm) {
      console.log(chalk.yellow('Operation cancelled'));
      process.exit(0);
    }

    console.log(chalk.cyan('\n📋 Follow these steps:'));
    console.log(chalk.white('1. Visit: https://engify.ai/dashboard'));
    console.log(chalk.white('2. Go to Settings → API Keys'));
    console.log(chalk.white('3. Click "Generate MCP Token"'));
    console.log(chalk.white('4. Copy the token\n'));

    const { token } = await inquirer.prompt([{
      type: 'input',
      name: 'token',
      message: 'Paste your MCP token here:',
      validate: (input: string) => {
        if (!input.trim()) {
          return 'Token is required';
        }
        if (input.length < 50) {
          return 'Token appears to be invalid (too short)';
        }
        return true;
      },
    }]);

    // Parse JWT to get user info and expiry
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      
      const config: AuthConfig = {
        userId: payload.sub,
        accessToken: token,
        expiresAt: payload.exp * 1000, // Convert to milliseconds
        createdAt: Date.now(),
      };

      this.storeToken(config);

      console.log(chalk.green.bold('\n✅ Token configured successfully!'));
      console.log(chalk.gray(`User ID: ${payload.sub}`));
      console.log(chalk.gray(`Expires: ${new Date(config.expiresAt).toLocaleString()}`));

    } catch (error) {
      console.error(chalk.red('❌ Invalid token format'), error);
      process.exit(1);
    }
  }

  /**
   * Show current token status
   */
  private showStatus(): void {
    const token = this.getToken();
    
    if (!token) {
      console.log(chalk.yellow('⚠️  No token found'));
      return;
    }

    const now = Date.now();
    const remaining = token.expiresAt - now;
    const hoursRemaining = Math.floor(remaining / (1000 * 60 * 60));

    console.log(chalk.green('✅ Token found'));
    console.log(chalk.gray(`User ID: ${token.userId}`));
    console.log(chalk.gray(`Expires in: ${hoursRemaining} hours`));
    console.log(chalk.gray(`Created: ${new Date(token.createdAt).toLocaleString()}`));
  }

  /**
   * Run the token management flow
   */
  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0] || 'check';

    switch (command) {
      case 'status':
        this.showStatus();
        break;

      case 'generate':
        await this.generateNewToken();
        break;

      case 'check':
      default:
        if (this.hasValidToken()) {
          console.log(chalk.green('✅ Valid token found'));
          this.showStatus();
        } else {
          console.log(chalk.yellow('⚠️  No valid token found'));
          await this.generateNewToken();
        }
        break;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const manager = new TokenManager();
  manager.run().catch(console.error);
}

export { TokenManager };
