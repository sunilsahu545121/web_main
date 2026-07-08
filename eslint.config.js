import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: ['dist/**', 'build/**', 'node_modules/**', 'supabase/**', 'tailwind.config.ts', '*.tsbuildinfo'],
  },
  {
    files: ['src/**/*.{ts,tsx}', 'vite.config.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        atob: 'readonly',
        Blob: 'readonly',
        console: 'readonly',
        confirm: 'readonly',
        document: 'readonly',
        File: 'readonly',
        FormData: 'readonly',
        HTMLInputElement: 'readonly',
        localStorage: 'readonly',
        MediaStream: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
        URL: 'readonly',
        window: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
