import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary', 'json'],
      thresholds: {
        statements: 70,
        branches: 70,
      },
      include: [
        'src/services/**',
        'src/api/**',
        'src/components',
        'src/contexts',
        'src/hooks',
        'src/routes',
        'src/test'
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/setup.ts',
        'node_modules/**'
      ]
    }
  },
})
