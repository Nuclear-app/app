import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'
import react from 'eslint-plugin-react'
import globals from 'globals'

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
      'react-hooks': reactHooks
    },
    rules: {
      // Critical TypeScript rules (keep strict)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-var-requires': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/consistent-type-assertions': 'warn',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-redeclare': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',

      // React rules (relaxed)
      'react/jsx-pascal-case': 'warn',
      'react/no-array-index-key': 'warn',
      'react/no-unknown-property': 'warn',
      'react/jsx-no-constructed-context-values': 'warn',
      'react-hooks/exhaustive-deps': 'warn',

      // General rules (relaxed)
      'no-duplicate-imports': 'warn',
      'no-redeclare': 'warn',
      'no-useless-escape': 'warn',
      'no-mixed-spaces-and-tabs': 'warn',
      'eqeqeq': 'warn',
      'complexity': 'warn',
      'no-unused-expressions': 'warn',

      // Disable overly strict rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'complexity': 'off'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
] 