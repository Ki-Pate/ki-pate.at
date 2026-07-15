import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:43110';
const windowsLaunchOptions = process.platform === 'win32'
  ? { launchOptions: { args: ['--disable-features=TcpPortRandomizationWin'] } }
  : {};

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.mjs',
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node tools/serve-preview.mjs',
    url: baseURL,
    reuseExistingServer: false,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], ...windowsLaunchOptions },
    },
  ],
});
