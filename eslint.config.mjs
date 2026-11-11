import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'public/**']),
  {
    rules: {
      // The codebase predates strict API typing; `any` is tracked as a warning, not a blocker.
      '@typescript-eslint/no-explicit-any': 'warn',
      // React 19 compiler-era advice. Existing prop->state syncing effects and the map's
      // ref-based popup positioning work correctly; refactor them gradually, don't block on them.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
      '@typescript-eslint/no-unused-expressions': ['warn', { allowShortCircuit: true, allowTernary: true }],
    },
  },
])
