import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    // You might want to add coverage collection later
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});