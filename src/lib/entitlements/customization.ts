/**
 * Entitlement Checks
 * Determines if a user has access to premium features
 */

import { UserRole } from '@/lib/auth/rbac';

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';

/**
 * Check if user has premium entitlement for prompt customization
 * Currently: Free for all users (beta mode), but requires login to save
 * Future: Can be gated by subscription tier
 */
export function hasPromptCustomizationEntitlement(
  userRole?: UserRole | string | null,
  _subscriptionTier?: SubscriptionTier | string | null
): boolean {
  // Beta mode: Available to all logged-in users
  // Future: Gate by subscription tier
  // For now, any authenticated user can use customization
  if (!userRole) return false; // Must be logged in
  
  // All authenticated users get access during beta
  // Future: Add subscription tier check
  // return _subscriptionTier === 'pro' || _subscriptionTier === 'enterprise';
  return true;
}

/**
 * Check if user can save to collection (requires login)
 */
export function canSaveToCollection(
  isAuthenticated: boolean
): boolean {
  return isAuthenticated;
}


