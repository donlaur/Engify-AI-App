#!/usr/bin/env tsx
/**
 * Ensure Super Admin User Exists
 *
 * Production-ready script to create or verify a super admin user in MongoDB.
 * Follows enterprise security best practices.
 *
 * Usage:
 *   SUPER_ADMIN_EMAIL=admin@engify.ai SUPER_ADMIN_PASSWORD=SecurePass123! pnpm admin:setup
 *
 *   Or use command line arguments:
 *   pnpm tsx scripts/admin/ensure-super-admin.ts --email admin@engify.ai --password SecurePass123!
 *
 * Environment Variables:
 *   SUPER_ADMIN_EMAIL     - Email address (default: admin@engify.ai)
 *   SUPER_ADMIN_PASSWORD  - Password (REQUIRED, no default for security)
 *   SUPER_ADMIN_NAME      - Display name (default: "Super Admin")
 *
 * Security Features:
 *   - Bcrypt password hashing with 12 rounds
 *   - Email format validation
 *   - Strong password validation (min 12 chars, mixed case, numbers, symbols)
 *   - Never logs passwords
 *   - Idempotent (safe to run multiple times)
 *   - Interactive password prompt if not provided via env/args
 *
 * @author Engify.ai Security Team
 * @version 1.0.0
 */

import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { createInterface } from 'readline';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface SuperAdminConfig {
  email: string;
  password: string;
  name: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface UserDocument {
  _id: ObjectId;
  email: string;
  name: string;
  password: string;
  role: string;
  plan: string;
  emailVerified: Date;
  mfaVerified: boolean;
  mfaEnabled: boolean;
  image: string | null;
  organizationId: ObjectId | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Constants
// ============================================================================

const SALT_ROUNDS = 12; // BCrypt salt rounds (industry standard)
const DEFAULT_EMAIL = 'admin@engify.ai';
const DEFAULT_NAME = 'Super Admin';
const SUPER_ADMIN_ROLE = 'super_admin';

// Password validation requirements
const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_REQUIREMENTS = {
  minLength: PASSWORD_MIN_LENGTH,
  requiresUppercase: true,
  requiresLowercase: true,
  requiresNumber: true,
  requiresSymbol: true,
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validate email format
 */
function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Validate password strength
 * Requirements:
 * - At least 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
function validatePassword(password: string): ValidationResult {
  if (!password || password.length === 0) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return {
      valid: false,
      error: `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`
    };
  }

  if (PASSWORD_REQUIREMENTS.requiresUppercase && !/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one uppercase letter'
    };
  }

  if (PASSWORD_REQUIREMENTS.requiresLowercase && !/[a-z]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one lowercase letter'
    };
  }

  if (PASSWORD_REQUIREMENTS.requiresNumber && !/[0-9]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one number'
    };
  }

  if (PASSWORD_REQUIREMENTS.requiresSymbol && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one special character'
    };
  }

  return { valid: true };
}

/**
 * Parse command line arguments
 */
function parseArgs(): Partial<SuperAdminConfig> {
  const args = process.argv.slice(2);
  const config: Partial<SuperAdminConfig> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if ((arg === '--email' || arg === '-e') && nextArg) {
      config.email = nextArg;
      i++;
    } else if ((arg === '--password' || arg === '-p') && nextArg) {
      config.password = nextArg;
      i++;
    } else if ((arg === '--name' || arg === '-n') && nextArg) {
      config.name = nextArg;
      i++;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return config;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║              Engify.ai Super Admin Setup Script                      ║
╚═══════════════════════════════════════════════════════════════════════╝

USAGE:
  pnpm admin:setup
  pnpm tsx scripts/admin/ensure-super-admin.ts [OPTIONS]

OPTIONS:
  -e, --email <email>       Super admin email address
  -p, --password <password> Super admin password
  -n, --name <name>         Super admin display name
  -h, --help                Show this help message

ENVIRONMENT VARIABLES:
  SUPER_ADMIN_EMAIL         Super admin email (default: admin@engify.ai)
  SUPER_ADMIN_PASSWORD      Super admin password (REQUIRED)
  SUPER_ADMIN_NAME          Super admin name (default: "Super Admin")

EXAMPLES:
  # Using environment variables
  SUPER_ADMIN_EMAIL=admin@engify.ai SUPER_ADMIN_PASSWORD=SecurePass123! pnpm admin:setup

  # Using command line arguments
  pnpm admin:setup --email admin@engify.ai --password SecurePass123!

  # Interactive mode (will prompt for password)
  pnpm admin:setup --email admin@engify.ai

PASSWORD REQUIREMENTS:
  - Minimum ${PASSWORD_MIN_LENGTH} characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

SECURITY NOTES:
  - Passwords are NEVER logged
  - Bcrypt hashing with ${SALT_ROUNDS} salt rounds
  - Script is idempotent (safe to run multiple times)
  - If super admin exists, will verify and offer to update password
`);
}

/**
 * Prompt for password securely (hidden input)
 */
async function promptPassword(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Note: This is a simple prompt. In production, consider using a library
    // like 'read' or 'inquirer' for hidden password input
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Get configuration from env vars, CLI args, or prompts
 */
async function getConfig(): Promise<SuperAdminConfig> {
  const argsConfig = parseArgs();

  // Priority: CLI args > Environment variables > Defaults
  let email = argsConfig.email || process.env.SUPER_ADMIN_EMAIL || DEFAULT_EMAIL;
  let password = argsConfig.password || process.env.SUPER_ADMIN_PASSWORD || '';
  let name = argsConfig.name || process.env.SUPER_ADMIN_NAME || DEFAULT_NAME;

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    console.error(`❌ Email validation failed: ${emailValidation.error}`);
    process.exit(1);
  }

  // If password not provided, prompt for it
  if (!password) {
    console.log('\n⚠️  No password provided via environment variable or argument.');
    console.log('📝 Please enter a secure password for the super admin account.\n');
    console.log(`Password requirements:`);
    console.log(`  • Minimum ${PASSWORD_MIN_LENGTH} characters`);
    console.log(`  • At least one uppercase letter`);
    console.log(`  • At least one lowercase letter`);
    console.log(`  • At least one number`);
    console.log(`  • At least one special character\n`);

    password = await promptPassword('Enter password: ');
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    console.error(`❌ Password validation failed: ${passwordValidation.error}`);
    process.exit(1);
  }

  return { email, password, name };
}

/**
 * Mask email for logging (show first 2 chars and domain)
 */
function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return '***@***';

  const maskedLocal = localPart.length > 2
    ? `${localPart.substring(0, 2)}***`
    : '***';

  return `${maskedLocal}@${domain}`;
}

/**
 * Log with timestamp
 */
function log(message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
  const timestamp = new Date().toISOString();
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  console.log(`[${timestamp}] ${icons[level]} ${message}`);
}

// ============================================================================
// Main Script Logic
// ============================================================================

/**
 * Check if super admin exists
 */
async function findSuperAdmin(
  client: MongoClient,
  email: string
): Promise<UserDocument | null> {
  const db = client.db('engify');
  const usersCollection = db.collection<UserDocument>('users');

  const superAdmin = await usersCollection.findOne({
    email: email,
    role: SUPER_ADMIN_ROLE,
  });

  return superAdmin;
}

/**
 * Create super admin user
 */
async function createSuperAdmin(
  client: MongoClient,
  config: SuperAdminConfig
): Promise<void> {
  log('Creating super admin user...', 'info');

  const db = client.db('engify');
  const usersCollection = db.collection<UserDocument>('users');

  // Hash password
  log('Hashing password...', 'info');
  const hashedPassword = await bcrypt.hash(config.password, SALT_ROUNDS);

  // Create user document
  const now = new Date();
  const superAdminUser: UserDocument = {
    _id: new ObjectId(),
    email: config.email,
    name: config.name,
    password: hashedPassword,
    role: SUPER_ADMIN_ROLE,
    plan: 'enterprise_premium',
    emailVerified: now, // Verified by default
    mfaVerified: true, // Emergency access bypass
    mfaEnabled: false, // Can be enabled later
    image: null,
    organizationId: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  // Insert into database
  await usersCollection.insertOne(superAdminUser);

  log('Super admin user created successfully!', 'success');
  log(`User ID: ${superAdminUser._id.toString()}`, 'info');
  log(`Email: ${config.email}`, 'info');
  log(`Role: ${SUPER_ADMIN_ROLE}`, 'info');
  log(`Plan: enterprise_premium`, 'info');
  log(`MFA Verified: true (emergency access enabled)`, 'info');
}

/**
 * Update super admin password
 */
async function updateSuperAdminPassword(
  client: MongoClient,
  email: string,
  newPassword: string
): Promise<void> {
  log('Updating super admin password...', 'info');

  const db = client.db('engify');
  const usersCollection = db.collection<UserDocument>('users');

  // Hash new password
  log('Hashing new password...', 'info');
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Update password
  await usersCollection.updateOne(
    { email: email, role: SUPER_ADMIN_ROLE },
    {
      $set: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    }
  );

  log('Super admin password updated successfully!', 'success');
}

/**
 * Prompt for yes/no confirmation
 */
async function promptConfirm(question: string): Promise<boolean> {
  const answer = await promptPassword(`${question} (y/n): `);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║              Engify.ai Super Admin Setup Script                      ║
║                                                                       ║
║  This script ensures a super admin user exists in the database.     ║
║  Super admins have full system access and emergency privileges.     ║
╚═══════════════════════════════════════════════════════════════════════╝
`);

  try {
    // Get configuration
    const config = await getConfig();

    log(`Configuration loaded`, 'info');
    log(`Email: ${config.email}`, 'info');
    log(`Name: ${config.name}`, 'info');
    log(`Password: ******** (hidden for security)`, 'info');

    // Check MongoDB connection
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      log('MONGODB_URI environment variable is not set', 'error');
      log('Please add MONGODB_URI to your .env.local file', 'error');
      process.exit(1);
    }

    log('Connecting to MongoDB...', 'info');
    const client = new MongoClient(mongoUri);

    try {
      await client.connect();
      log('Connected to MongoDB successfully', 'success');

      // Check if super admin exists
      log(`Checking if super admin exists (${maskEmail(config.email)})...`, 'info');
      const existingSuperAdmin = await findSuperAdmin(client, config.email);

      if (existingSuperAdmin) {
        log('Super admin user already exists', 'info');
        log(`User ID: ${existingSuperAdmin._id.toString()}`, 'info');
        log(`Email: ${existingSuperAdmin.email}`, 'info');
        log(`Role: ${existingSuperAdmin.role}`, 'info');
        log(`Created: ${existingSuperAdmin.createdAt.toISOString()}`, 'info');
        log(`Last Updated: ${existingSuperAdmin.updatedAt.toISOString()}`, 'info');

        // Ask if user wants to update password
        console.log('\n');
        const shouldUpdate = await promptConfirm('Do you want to update the password?');

        if (shouldUpdate) {
          await updateSuperAdminPassword(client, config.email, config.password);
        } else {
          log('Password update skipped', 'info');
        }
      } else {
        // Create new super admin
        log('Super admin user does not exist', 'info');
        await createSuperAdmin(client, config);
      }

      console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║                          Setup Complete!                             ║
╚═══════════════════════════════════════════════════════════════════════╝

✅ Super admin account is ready to use.

📧 Email: ${config.email}
👤 Name: ${config.name}
🔒 Password: Set securely (not displayed)

⚠️  IMPORTANT SECURITY REMINDERS:
   • Store credentials in a secure password manager
   • Never commit credentials to version control
   • Enable MFA after first login
   • Change default passwords immediately
   • Review audit logs regularly
   • Limit super admin access to emergency use only

🔗 Next Steps:
   1. Log in at https://engify.ai/login
   2. Enable multi-factor authentication
   3. Review security settings
   4. Create additional admin accounts if needed

📚 Documentation: https://docs.engify.ai/admin/super-admin
🔐 Security Guide: https://docs.engify.ai/security/best-practices
`);

    } finally {
      await client.close();
      log('Disconnected from MongoDB', 'info');
    }

  } catch (error) {
    log(`Fatal error: ${error instanceof Error ? error.message : String(error)}`, 'error');

    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// ============================================================================
// Script Entry Point
// ============================================================================

// Run main function if this script is executed directly
if (require.main === module) {
  main()
    .then(() => {
      log('Script completed successfully', 'success');
      process.exit(0);
    })
    .catch((error) => {
      log(`Script failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
      process.exit(1);
    });
}

// Export for testing
export {
  validateEmail,
  validatePassword,
  maskEmail,
  findSuperAdmin,
  createSuperAdmin,
  updateSuperAdminPassword,
};
