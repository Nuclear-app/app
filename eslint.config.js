import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'
import react from 'eslint-plugin-react'
import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals'

function warnifyRules(rules) {
  return Object.fromEntries(
    Object.entries(rules).map(([k, v]) => [k, Array.isArray(v) ? ['warn', ...(v.slice(1))] : 'warn'])
  );
}

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      '*.config.js',
      '*.config.ts',
      'postcss.config.js',
      'tailwind.config.ts',
      'next-env.d.ts',
      'test-markdown.js',
      '**/*.generated.*',
      'prisma/generated/**',
      '**/generated/**'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
        console: 'readonly',
        process: 'readonly',
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        define: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        vi: 'readonly',
        expectTypeOf: 'readonly',
        assertType: 'readonly'
      },
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        },
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': react,
      'react-hooks': reactHooks,
      '@next/next': nextPlugin
    },
    rules: {
      ...warnifyRules(js.configs.recommended.rules),
      ...warnifyRules(tseslint.configs.recommended.rules),
      ...warnifyRules(react.configs.recommended.rules),
      ...warnifyRules(reactHooks.configs.recommended.rules),
      ...warnifyRules(nextPlugin.configs.recommended.rules),
      ...warnifyRules(nextPlugin.configs['core-web-vitals'].rules),
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
] 