/**
 * User Test Fixtures
 *
 * Factory functions and fixtures for creating test user data
 */

import { nanoid } from 'nanoid';

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'user';
export type UserPlan = 'free' | 'pro' | 'enterprise';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface TestUser {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  role: UserRole;
  plan: UserPlan;
  status?: UserStatus;
  organizationId?: string;
  emailVerified?: Date | null;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    language?: string;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Default user fixture values
 */
const defaultUser: Partial<TestUser> = {
  status: 'active',
  plan: 'free',
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
  preferences: {
    theme: 'system',
    notifications: true,
    language: 'en',
  },
};

/**
 * User Factory - Create test users with custom properties
 *
 * @example
 * const user = createUser({ role: 'admin', plan: 'pro' });
 * const superAdmin = createUser({ role: 'super_admin' });
 */
export function createUser(overrides: Partial<TestUser> = {}): TestUser {
  const id = overrides._id || overrides.id || nanoid();
  const email =
    overrides.email || `test-user-${id.slice(0, 8)}@example.com`;
  const name = overrides.name || `Test User ${id.slice(0, 8)}`;

  return {
    ...defaultUser,
    _id: id,
    id,
    email,
    name,
    ...overrides,
  } as TestUser;
}

/**
 * Create multiple users at once
 *
 * @example
 * const users = createUsers(5);
 * const admins = createUsers(3, { role: 'admin' });
 */
export function createUsers(
  count: number,
  overrides: Partial<TestUser> = {}
): TestUser[] {
  return Array.from({ length: count }, () => createUser(overrides));
}

/**
 * Pre-defined user fixtures for common scenarios
 */
export const userFixtures = {
  /**
   * Regular free user
   */
  regular: (): TestUser =>
    createUser({
      email: 'regular@example.com',
      name: 'Regular User',
      role: 'user',
      plan: 'free',
    }),

  /**
   * Pro plan user
   */
  pro: (): TestUser =>
    createUser({
      email: 'pro@example.com',
      name: 'Pro User',
      role: 'user',
      plan: 'pro',
    }),

  /**
   * Enterprise user
   */
  enterprise: (): TestUser =>
    createUser({
      email: 'enterprise@example.com',
      name: 'Enterprise User',
      role: 'user',
      plan: 'enterprise',
      organizationId: 'org-1',
    }),

  /**
   * Admin user
   */
  admin: (): TestUser =>
    createUser({
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      plan: 'pro',
    }),

  /**
   * Super admin user
   */
  superAdmin: (): TestUser =>
    createUser({
      email: 'superadmin@example.com',
      name: 'Super Admin',
      role: 'super_admin',
      plan: 'enterprise',
    }),

  /**
   * Editor user
   */
  editor: (): TestUser =>
    createUser({
      email: 'editor@example.com',
      name: 'Editor User',
      role: 'editor',
      plan: 'pro',
    }),

  /**
   * Unverified user
   */
  unverified: (): TestUser =>
    createUser({
      email: 'unverified@example.com',
      name: 'Unverified User',
      emailVerified: null,
      status: 'pending',
    }),

  /**
   * Suspended user
   */
  suspended: (): TestUser =>
    createUser({
      email: 'suspended@example.com',
      name: 'Suspended User',
      status: 'suspended',
    }),
};

/**
 * Session fixture for authenticated users
 */
export interface TestSession {
  user: {
    id: string;
    email: string;
    role: UserRole;
    plan: UserPlan;
    organizationId?: string;
  };
  expires: string;
}

/**
 * Create a test session for a user
 */
export function createSession(user?: Partial<TestUser>): TestSession {
  const testUser = createUser(user);
  return {
    user: {
      id: testUser.id || testUser._id || nanoid(),
      email: testUser.email,
      role: testUser.role,
      plan: testUser.plan,
      organizationId: testUser.organizationId,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}
