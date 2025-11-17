import { ESLint } from 'eslint';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const eslint = new ESLint({
    cwd: __dirname,
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    baseConfig: {
      extends: [
        'next/core-web-vitals',
        'plugin:@typescript-eslint/recommended',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: null,
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
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'prefer-const': 'error',
        'no-var': 'error',
      },
    },
    ignore: true,
    overrideConfigFile: null,
  });

  try {
    const results = await eslint.lintFiles(['src/**/*.{ts,tsx}']);

    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);

    console.log(resultText);

    const errorCount = results.reduce((sum, result) => sum + result.errorCount, 0);
    const warningCount = results.reduce((sum, result) => sum + result.warningCount, 0);

    console.log(`\n\nSummary: ${errorCount} errors, ${warningCount} warnings`);

    if (errorCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error running ESLint:', error);
    process.exit(1);
  }
}

main();
