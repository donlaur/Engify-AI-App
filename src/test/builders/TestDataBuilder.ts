/**
 * Test Data Builder Pattern
 *
 * Provides a fluent API for building complex test data objects
 */

import { createUser, createPrompt, TestUser, TestPrompt } from '../fixtures';
import type { TestSession } from '../fixtures/users';

/**
 * Generic Builder base class
 */
export abstract class Builder<T> {
  protected data: Partial<T>;

  constructor(defaults: Partial<T> = {}) {
    this.data = { ...defaults };
  }

  /**
   * Set a property value
   */
  with<K extends keyof T>(key: K, value: T[K]): this {
    this.data[key] = value;
    return this;
  }

  /**
   * Set multiple properties at once
   */
  withMany(values: Partial<T>): this {
    this.data = { ...this.data, ...values };
    return this;
  }

  /**
   * Build the final object
   */
  abstract build(): T;
}

/**
 * User Builder - Fluent API for building test users
 *
 * @example
 * const admin = new UserBuilder()
 *   .withRole('admin')
 *   .withPlan('pro')
 *   .withEmail('admin@test.com')
 *   .build();
 *
 * const users = new UserBuilder()
 *   .withRole('user')
 *   .buildMany(5);
 */
export class UserBuilder extends Builder<TestUser> {
  constructor() {
    super({});
  }

  withEmail(email: string): this {
    return this.with('email', email);
  }

  withName(name: string): this {
    return this.with('name', name);
  }

  withRole(role: TestUser['role']): this {
    return this.with('role', role);
  }

  withPlan(plan: TestUser['plan']): this {
    return this.with('plan', plan);
  }

  withStatus(status: TestUser['status']): this {
    return this.with('status', status);
  }

  withOrganization(orgId: string): this {
    return this.with('organizationId', orgId);
  }

  asAdmin(): this {
    return this.withRole('admin').withPlan('pro');
  }

  asSuperAdmin(): this {
    return this.withRole('super_admin').withPlan('enterprise');
  }

  asRegular(): this {
    return this.withRole('user').withPlan('free');
  }

  asPro(): this {
    return this.withRole('user').withPlan('pro');
  }

  verified(): this {
    return this.with('emailVerified', new Date());
  }

  unverified(): this {
    return this.with('emailVerified', null).with('status', 'pending');
  }

  suspended(): this {
    return this.with('status', 'suspended');
  }

  build(): TestUser {
    return createUser(this.data);
  }

  buildMany(count: number): TestUser[] {
    return Array.from({ length: count }, () => this.build());
  }
}

/**
 * Prompt Builder - Fluent API for building test prompts
 *
 * @example
 * const prompt = new PromptBuilder()
 *   .withTitle('My Prompt')
 *   .withCategory('coding')
 *   .featured()
 *   .withRating(4.8)
 *   .build();
 */
export class PromptBuilder extends Builder<TestPrompt> {
  constructor() {
    super({});
  }

  withTitle(title: string): this {
    return this.with('title', title);
  }

  withDescription(description: string): this {
    return this.with('description', description);
  }

  withContent(content: string): this {
    return this.with('content', content);
  }

  withCategory(category: TestPrompt['category']): this {
    return this.with('category', category);
  }

  withTags(...tags: string[]): this {
    return this.with('tags', tags);
  }

  withStatus(status: TestPrompt['status']): this {
    return this.with('status', status);
  }

  withRating(rating: number): this {
    return this.with('rating', rating);
  }

  withUsageCount(count: number): this {
    return this.with('usageCount', count);
  }

  withFavoriteCount(count: number): this {
    return this.with('favoriteCount', count);
  }

  withAuthor(userId: string, name?: string): this {
    this.with('userId', userId);
    if (name) {
      this.with('authorName', name);
    }
    return this;
  }

  featured(): this {
    return this.with('featured', true);
  }

  draft(): this {
    return this.with('status', 'draft');
  }

  published(): this {
    return this.with('status', 'published');
  }

  archived(): this {
    return this.with('status', 'archived');
  }

  popular(): this {
    return this.withRating(4.5).withUsageCount(100).withFavoriteCount(50);
  }

  withPattern(pattern: string): this {
    const metadata = this.data.metadata || {};
    return this.with('metadata', { ...metadata, pattern });
  }

  build(): TestPrompt {
    return createPrompt(this.data);
  }

  buildMany(count: number): TestPrompt[] {
    return Array.from({ length: count }, () => this.build());
  }
}

/**
 * Session Builder - For building authenticated session data
 *
 * @example
 * const session = new SessionBuilder()
 *   .withUser({ role: 'admin' })
 *   .withExpiry(24)
 *   .build();
 */
export class SessionBuilder {
  private user: Partial<TestUser> = {};
  private expiryHours: number = 24;

  withUser(user: Partial<TestUser>): this {
    this.user = user;
    return this;
  }

  withExpiry(hours: number): this {
    this.expiryHours = hours;
    return this;
  }

  asAdmin(): this {
    this.user = { ...this.user, role: 'admin', plan: 'pro' };
    return this;
  }

  asSuperAdmin(): this {
    this.user = { ...this.user, role: 'super_admin', plan: 'enterprise' };
    return this;
  }

  asRegular(): this {
    this.user = { ...this.user, role: 'user', plan: 'free' };
    return this;
  }

  build(): TestSession {
    const testUser = createUser(this.user);
    return {
      user: {
        id: testUser.id || testUser._id || 'test-user',
        email: testUser.email,
        role: testUser.role,
        plan: testUser.plan,
        organizationId: testUser.organizationId,
      },
      expires: new Date(
        Date.now() + this.expiryHours * 60 * 60 * 1000
      ).toISOString(),
    };
  }
}

/**
 * Convenience factory functions for common scenarios
 */
export const builders = {
  user: () => new UserBuilder(),
  prompt: () => new PromptBuilder(),
  session: () => new SessionBuilder(),
};
