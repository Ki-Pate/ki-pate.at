import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getBufferWindow,
  getClipState,
  getSceneState,
} from '../demos/shared/scroll-engine.js';

test('maps all six scene midpoints to the canonical scene order', () => {
  const expectedScenes = [
    [0.0833, 'chaos'],
    [0.25, 'inbox'],
    [0.4167, 'offer'],
    [0.5833, 'meeting'],
    [0.75, 'knowledge'],
    [0.9167, 'control'],
  ];

  for (const [progress, id] of expectedScenes) {
    assert.equal(getSceneState(progress).id, id);
  }
});

test('maps an exact clip boundary to the following clip', () => {
  assert.deepEqual(getClipState(0.5, 2), { index: 1, progress: 0 });
});

test('buffers the current clip and its direct neighbours', () => {
  assert.deepEqual(getBufferWindow(2, 5), [1, 2, 3]);
});
