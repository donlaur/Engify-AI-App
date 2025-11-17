/**
 * Vitest Coverage Configuration
 *
 * Defines coverage thresholds and requirements for different parts of the codebase.
 * This configuration enforces higher coverage standards for critical business logic.
 */

export interface CoverageThreshold {
  lines: number;
  functions: number;
  branches: number;
  statements: number;
}

/**
 * Default global coverage thresholds
 */
export const globalThresholds: CoverageThreshold = {
  lines: 70,
  functions: 70,
  branches: 65,
  statements: 70,
};

/**
 * Per-directory coverage thresholds
 * Critical paths require higher coverage
 */
export const directoryThresholds: Record<string, CoverageThreshold> = {
  // Critical business logic - highest standards
  'src/lib/services': {
    lines: 85,
    functions: 85,
    branches: 80,
    statements: 85,
  },
  'src/lib/repositories': {
    lines: 85,
    functions: 85,
    branches: 80,
    statements: 85,
  },
  'src/lib/security': {
    lines: 90,
    functions: 90,
    branches: 85,
    statements: 90,
  },

  // API routes - high standards
  'src/app/api': {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80,
  },

  // Core utilities and infrastructure
  'src/lib/utils': {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80,
  },
  'src/lib/db': {
    lines: 75,
    functions: 75,
    branches: 70,
    statements: 75,
  },
  'src/lib/cache': {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80,
  },

  // AI/ML integration - moderate standards (external dependencies)
  'src/lib/ai': {
    lines: 70,
    functions: 70,
    branches: 65,
    statements: 70,
  },

  // UI Components - moderate standards (visual testing preferred)
  'src/components': {
    lines: 65,
    functions: 65,
    branches: 60,
    statements: 65,
  },

  // Pages/App router - basic standards (E2E testing preferred)
  'src/app': {
    lines: 60,
    functions: 60,
    branches: 55,
    statements: 60,
  },
};

/**
 * Files that require 100% coverage (critical functionality)
 */
export const criticalFiles: string[] = [
  'src/lib/security/sanitizer.ts',
  'src/lib/logging/sanitizer.ts',
  'src/lib/utils/validation.ts',
  'src/lib/security/piiRedaction.ts',
];

/**
 * Minimum coverage for new files (encourages TDD)
 */
export const newFileThreshold: CoverageThreshold = {
  lines: 80,
  functions: 80,
  branches: 75,
  statements: 80,
};

/**
 * Coverage badge thresholds for display
 */
export const badgeThresholds = {
  excellent: 90,
  good: 80,
  moderate: 70,
  poor: 60,
};
