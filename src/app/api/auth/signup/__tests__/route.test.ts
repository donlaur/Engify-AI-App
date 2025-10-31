/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Signup API Route Tests
 * Tests user registration with validation and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { ObjectId } from 'mongodb';

// Mock dependencies
vi.mock('@/lib/services/UserService', () => ({
  userService: {
    findByEmail: vi.fn(),
    createUser: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('$2b$12$hashedpassword'),
}));

vi.mock('@/lib/db/mongodb', () => ({
  getMongoDb: vi.fn().mockResolvedValue({
    collection: vi.fn().mockReturnValue({
      updateOne: vi
        .fn()
        .mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
    }),
  }),
}));

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create user successfully with valid data', async () => {
    const { userService } = await import('@/lib/services/UserService');
    const { hash } = await import('bcryptjs');

    vi.mocked(userService.findByEmail).mockResolvedValue(null);
    vi.mocked(userService.createUser).mockResolvedValue({
      _id: new ObjectId('507f1f77bcf86cd799439011'),
      email: 'test@example.com',
      name: 'Test User',
      password: '$2b$12$hashedpassword',
      role: 'user',
      plan: 'free',
      emailVerified: null,
      image: null,
      organizationId: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toBeDefined();
    expect(data.data.email).toBe('test@example.com');
    expect(data.data.name).toBe('Test User');
    expect(data.data.password).toBeUndefined(); // Should not return password
    expect(hash).toHaveBeenCalledWith('Password123', 12);
    expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(userService.createUser).toHaveBeenCalled();
  });

  it('should reject invalid email format', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'Password123',
        name: 'Test User',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBe('Validation failed');
  });

  it('should reject password without uppercase letter', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(422);
  });

  it('should reject password without lowercase letter', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'PASSWORD123',
        name: 'Test User',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(422);
  });

  it('should reject password without number', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password',
        name: 'Test User',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(422);
  });

  it('should reject password shorter than 8 characters', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Pass1',
        name: 'Test User',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(422);
  });

  it('should reject duplicate email', async () => {
    const { userService } = await import('@/lib/services/UserService');

    vi.mocked(userService.findByEmail).mockResolvedValue({
      _id: 'existing',
      email: 'test@example.com',
    } as any);

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email already registered');
  });

  it('should handle server errors gracefully', async () => {
    const { userService } = await import('@/lib/services/UserService');

    vi.mocked(userService.findByEmail).mockRejectedValue(
      new Error('Database error')
    );

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create account');
  });

  it('should reject missing required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        // Missing password and name
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(422);
  });

  it('should reject name that is too long', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123',
        name: 'A'.repeat(101), // 101 characters
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(422);
  });
});
