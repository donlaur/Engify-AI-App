#!/usr/bin/env node

/**
 * Engify MCP Server Launcher
 * 
 * This launcher script:
 * 1. Reads stored authentication token
 * 2. Validates token expiry
 * 3. Starts MCP server with proper credentials
 * 4. Handles token refresh if needed
 * 
 * Used by IDEs (Cursor/VS Code) to start authenticated MCP server.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { spawn } from 'child_process';
import chalk from 'chalk';
import { jwtVerify } from 'jose';

const CONFIG_FILE = join(homedir(), '.engify-mcp-auth.json');
const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET! || 'fallback-secret');

interface AuthConfig {
  userId: string;
  accessToken: string;
  expiresAt: number;
  createdAt: number;
}

class MCPLauncher {
  private configPath: string;

  constructor() {
    this.configPath = CONFIG_FILE;
  }

  /**
   * Read and validate stored authentication
   */
  private async getAuthConfig(): Promise<AuthConfig | null> {
    if (!existsSync(this.configPath)) {
      console.error(chalk.red('❌ No authentication found. Run "pnpm auth" first.'));
      return null;
    }

    try {
      const config: AuthConfig = JSON.parse(readFileSync(this.configPath, 'utf8'));
      
      // Check if token is expired
      const now = Date.now();
      if (now >= config.expiresAt) {
        console.error(chalk.yellow('⚠️  Token expired. Please run "pnpm auth" to refresh.'));
        return null;
      }

      // Validate JWT signature and claims
      try {
        const { payload } = await jwtVerify(config.accessToken, JWT_SECRET);
        
        // Verify required claims
        if (!payload.sub || !payload.email) {
          console.error(chalk.red('❌ Invalid token: missing required claims'));
          return null;
        }

        // Verify audience
        if (payload.aud !== 'urn:mcp:bug-reporter') {
          console.error(chalk.red('❌ Invalid token: wrong audience'));
          return null;
        }

        return config;
      } catch (error) {
        console.error(chalk.red('❌ Invalid token signature'), error);
        return null;
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to read authentication config'), error);
      return null;
    }
  }

  /**
   * Start MCP server with authentication
   */
  private async startMCPServer(authConfig: AuthConfig): Promise<void> {
    console.log(chalk.blue('🚀 Starting Engify MCP Server...'));
    console.log(chalk.gray(`User: ${authConfig.userId}`));
    console.log(chalk.gray(`Token expires: ${new Date(authConfig.expiresAt).toLocaleString()}\n`));

    // Spawn MCP server with credentials as command line arguments
    const serverProcess = spawn('node', [
      'server.js',
      authConfig.userId,
      authConfig.accessToken
    ], {
      stdio: 'inherit', // Pipe stdin/stdout/stderr to parent
      cwd: __dirname,
      env: {
        ...process.env,
        ENGIFY_USER_ID: authConfig.userId,
        ENGIFY_ACCESS_TOKEN: authConfig.accessToken,
      }
    });

    // Handle process events
    serverProcess.on('error', (error) => {
      console.error(chalk.red('❌ Failed to start MCP server:'), error);
      process.exit(1);
    });

    serverProcess.on('exit', (code, signal) => {
      if (code !== 0) {
        console.error(chalk.red(`❌ MCP server exited with code ${code}`));
        process.exit(code || 1);
      }
      
      if (signal) {
        console.error(chalk.red(`❌ MCP server killed by signal ${signal}`));
        process.exit(1);
      }
    });

    // Forward signals to child process
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n🛑 Shutting down MCP server...'));
      serverProcess.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      console.log(chalk.yellow('\n🛑 Shutting down MCP server...'));
      serverProcess.kill('SIGTERM');
    });

    console.log(chalk.green('✅ MCP server started successfully'));
    console.log(chalk.gray('Press Ctrl+C to stop the server\n'));
  }

  /**
   * Run the launcher
   */
  async run(): Promise<void> {
    // Check for help flag
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      console.log(chalk.bold('Engify MCP Server Launcher'));
      console.log('');
      console.log('Usage:');
      console.log('  pnpm start              Start MCP server');
      console.log('  pnpm auth                Authenticate server');
      console.log('  pnpm auth status         Check authentication status');
      console.log('  pnpm auth generate       Generate new token');
      console.log('');
      console.log('Configuration file:');
      console.log(`  ${CONFIG_FILE}`);
      return;
    }

    // Get and validate authentication
    const authConfig = await this.getAuthConfig();
    
    if (!authConfig) {
      process.exit(1);
    }

    // Start MCP server
    await this.startMCPServer(authConfig);
  }
}

// Run if called directly
if (require.main === module) {
  const launcher = new MCPLauncher();
  launcher.run().catch((error) => {
    console.error(chalk.red('❌ Launcher failed:'), error);
    process.exit(1);
  });
}

export { MCPLauncher };
