import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getBufferWindow,
  getClipState,
  getSceneState,
} from '../demos/shared/scroll-engine.js';

test('maps the fourth scene midpoint to meeting', () => {
  assert.equal(getSceneState(0.5833).id, 'meeting');
});

test('maps an exact clip boundary to the following clip', () => {
  assert.deepEqual(getClipState(0.5, 2), { index: 1, progress: 0 });
});

test('buffers the current clip and its direct neighbours', () => {
  assert.deepEqual(getBufferWindow(2, 5), [1, 2, 3]);
});
