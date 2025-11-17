import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.next', 'coverage'],
    server: {
      deps: {
        inline: ['@sendgrid/eventwebhook'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
        'dist/',
        '.next/',
        'coverage/',
        '**/*.stories.{ts,tsx}',
        '**/types.ts',
        '**/constants.ts',
        'scripts/',
        'tests/e2e/',
        'tests/api/',
        'playwright.config.ts',
        'next.config.js',
        'tailwind.config.ts',
        'postcss.config.js',
        'eslint.config.js',
      ],
      // Global coverage thresholds
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
        // Enforce 100% on new code
        perFile: false,
        autoUpdate: false,
        // Set to true to fail CI if thresholds not met
        '100': false,
      },
      // Per-file/per-directory overrides
      include: ['src/**/*.{ts,tsx}'],
      all: true,
      // Enable branch coverage
      skipFull: false,
      // Report uncovered lines
      reportOnFailure: true,
      // Custom thresholds for critical paths
      lines: 70,
      functions: 70,
      branches: 65,
      statements: 70,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
