import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettier from 'eslint-config-prettier'
import astro from 'eslint-plugin-astro'
import checkFile from 'eslint-plugin-check-file'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import vitest from 'eslint-plugin-vitest'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const ignores = globalIgnores([
  'dist',
  '.astro',
  'coverage',
  '.claude',
  '.gemini',
  '.vscode',
  '.husky',
  'test-results',
  'playwright-report',
  'blob-report',
  'playwright/.cache',
])

const baseJs = {
  ...js.configs.recommended,
  languageOptions: {
    globals: { ...globals.browser, ...globals.node },
  },
}

const typescript = tseslint.configs.recommended

const featureConventions = {
  files: ['**/*.{js,jsx,ts,tsx,astro}'],
  plugins: {
    'simple-import-sort': simpleImportSort,
    'check-file': checkFile,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
  },
}

const fileNaming = {
  files: ['**/*.{ts,tsx,astro}'],
  ignores: ['src/pages/**'],
  plugins: { 'check-file': checkFile },
  rules: {
    'check-file/filename-naming-convention': [
      'error',
      { '**/*.{ts,tsx,astro}': 'KEBAB_CASE' },
      { ignoreMiddleExtensions: true },
    ],
  },
}

const folderNaming = {
  files: ['src/**/!(__tests__|pages)/**'],
  plugins: { 'check-file': checkFile },
  rules: {
    'check-file/folder-naming-convention': [
      'error',
      { 'src/**/!(__tests__|pages)': 'KEBAB_CASE' },
    ],
  },
}

const reactHooksConfig = {
  files: ['**/*.{jsx,tsx}'],
  plugins: { 'react-hooks': reactHooks },
  rules: reactHooks.configs.recommended.rules,
}

const testing = {
  files: ['**/*.test.{ts,tsx}'],
  plugins: { vitest },
  languageOptions: {
    globals: { ...vitest.environments.env.globals },
  },
  rules: vitest.configs.recommended.rules,
}

export default defineConfig([
  ignores,
  baseJs,
  ...typescript,
  ...astro.configs.recommended,
  featureConventions,
  fileNaming,
  folderNaming,
  reactHooksConfig,
  testing,
  prettier,
])
