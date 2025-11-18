/**
 * MongoDB Validation Utilities
 *
 * Security-focused validation helpers for MongoDB operations
 */

import { ObjectId } from 'mongodb';
import { z } from 'zod';

/**
 * Validate MongoDB ObjectId string
 * Prevents injection attacks and invalid ID formats
 */
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id) && /^[a-f\d]{24}$/i.test(id);
}

/**
 * Zod schema for MongoDB ObjectId validation
 * Use this in API routes to validate IDs before database queries
 */
export const ObjectIdSchema = z.string().refine(
  (id) => isValidObjectId(id),
  {
    message: 'Invalid ObjectId format',
  }
);

/**
 * Safe ObjectId converter
 * Returns ObjectId or null if invalid (prevents crashes)
 */
export function toObjectId(id: string): ObjectId | null {
  try {
    if (!isValidObjectId(id)) {
      return null;
    }
    return new ObjectId(id);
  } catch {
    return null;
  }
}

/**
 * Validate and convert to ObjectId (throws on invalid)
 * Use when you want to fail fast on invalid IDs
 */
export function validateObjectId(id: string): ObjectId {
  if (!isValidObjectId(id)) {
    throw new Error('Invalid ObjectId format');
  }
  return new ObjectId(id);
}
