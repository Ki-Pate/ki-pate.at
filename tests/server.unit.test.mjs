import assert from 'node:assert/strict';
import test from 'node:test';

import { parseRangeHeader } from '../tools/serve-preview.mjs';

test('parses a closed byte range', () => {
  assert.deepEqual(parseRangeHeader('bytes=100-199', 1000), { start: 100, end: 199 });
});
