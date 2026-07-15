import assert from 'node:assert/strict';
import test from 'node:test';

import config from '../playwright.config.mjs';

test('disables Chromium TCP port randomization only on Windows', () => {
  const args = config.projects[0].use.launchOptions?.args ?? [];

  assert.equal(
    args.includes('--disable-features=TcpPortRandomizationWin'),
    process.platform === 'win32',
  );
});
