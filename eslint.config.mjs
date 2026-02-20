import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // Ignore patterns
  {
    ignores: [
      '.output/**',
      '.wxt/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'wxt.config.ts', // WXT config not in tsconfig.json project
    ],
  },

  // Base ESLint recommended
  eslint.configs.recommended,

  // TypeScript recommended configs
  ...tseslint.configs.recommended,

  // Custom rules for the project
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        browser: 'readonly',
        chrome: 'readonly',
        defineBackground: 'readonly',
        defineContentScript: 'readonly',
      },
    },
    rules: {
      // Enforce AGENTS.md guidelines
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/consistent-type-imports': 'warn',

      // General code quality
      'no-console': 'warn',
      'prefer-const': 'error',
    },
  },

  // Prettier config to disable conflicting rules
  prettierConfig,
);
