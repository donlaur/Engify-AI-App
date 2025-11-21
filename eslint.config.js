import '@rushstack/eslint-patch/modern-module-resolution.js';
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import jsdoc from 'eslint-plugin-jsdoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/out/**',
      '**/build/**',
      '**/dist/**',
      '**/.vercel/**',
      '**/coverage/**',
      'scripts/.archived/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'plugin:@typescript-eslint/recommended'),
  {
    files: ['**/*.{ts,tsx,cts,mts}'],
    plugins: {
      jsdoc,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      // JSDoc rules for code documentation
      'jsdoc/require-jsdoc': [
        'warn',
        {
          require: {
            FunctionDeclaration: false, // Too noisy for all functions
            MethodDefinition: false,
            ClassDeclaration: true, // Require for classes
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
          // Only require JSDoc for exported functions (public API)
          contexts: [
            'ExportNamedDeclaration > FunctionDeclaration',
            'ExportDefaultDeclaration > FunctionDeclaration',
            'ExportNamedDeclaration > VariableDeclarator > ArrowFunctionExpression',
            'ExportDefaultDeclaration > ArrowFunctionExpression',
          ],
        },
      ],
      'jsdoc/check-syntax': 'error',
      'jsdoc/require-description': 'warn',
      'jsdoc/require-param': 'warn',
      'jsdoc/require-returns': 'warn',
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-types': 'warn',
      'jsdoc/check-alignment': 'warn',
      'jsdoc/check-indentation': 'warn',
      // Allow empty JSDoc for now (we're building up documentation)
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-returns-description': 'off',
    },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/chrome-extension/**/*.{js,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
    },
  },
  {
    files: ['services/mcp-server/**/*.{js,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['packages/shared-sdk/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: path.join(__dirname, 'packages/shared-sdk/tsconfig.json'),
        tsconfigRootDir: __dirname,
      },
    },
  },
];

