import assert from 'node:assert/strict';
import test from 'node:test';

import { calculatePotentialHours, SCENES } from '../demos/shared/content.js';

test('defines the canonical scene order', () => {
  assert.deepEqual(
    SCENES.map(({ id }) => id),
    ['chaos', 'inbox', 'offer', 'meeting', 'knowledge', 'control'],
  );
});

test('calculates the approved annual potential ranges', () => {
  assert.deepEqual(calculatePotentialHours(10), { min: 92, max: 184 });
  assert.deepEqual(calculatePotentialHours(20), { min: 184, max: 368 });
});

test('rejects weekly hours below the approved range', () => {
  assert.throws(() => calculatePotentialHours(0), /1 bis 80/);
});
