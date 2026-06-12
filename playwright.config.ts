import { defineConfig } from '@playwright/test';
import { withPostman } from 'postman-playwright';

export default withPostman(
  defineConfig({
    testDir: './tests',
    timeout: 30000,
    use: {
      baseURL: 'http://localhost:3000',
    },
    reporter: [['list']],
  })
);
