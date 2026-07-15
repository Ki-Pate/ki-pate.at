import assert from 'node:assert/strict';
import test from 'node:test';

import { createMediaController } from '../demos/shared/media-controller.js';

const FRAME = 1 / 30;

class FakeVideo extends EventTarget {
  constructor() {
    super();
    this.dataset = {};
    this.attributes = new Map();
    this.readyState = 0;
    this.duration = Number.NaN;
    this.seeking = false;
    this.seekAssignments = [];
    this.sourceAssignments = [];
    this.frameCallbacks = new Map();
    this.playResults = [];
    this.playCalls = 0;
    this.pauseCalls = 0;
    this.loadCalls = 0;
    this.throwOnSeek = false;
    this._currentTime = 0;
    this._src = '';
    this.nextFrameId = 1;
  }

  get currentTime() {
    return this._currentTime;
  }

  set currentTime(value) {
    if (this.throwOnSeek) throw new Error('synchronous seek failure');
    this._currentTime = value;
    this.seeking = true;
    this.seekAssignments.push(value);
  }

  get src() {
    return this._src;
  }

  set src(value) {
    this._src = value;
    if (value) this.sourceAssignments.push(value);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === 'src') this._src = '';
  }

  load() {
    this.loadCalls += 1;
  }

  play() {
    this.playCalls += 1;
    return this.playResults.shift() ?? Promise.resolve();
  }

  pause() {
    this.pauseCalls += 1;
  }

  requestVideoFrameCallback(callback) {
    const id = this.nextFrameId;
    this.nextFrameId += 1;
    this.frameCallbacks.set(id, callback);
    return id;
  }

  cancelVideoFrameCallback(id) {
    this.frameCallbacks.delete(id);
  }

  finishMetadata(duration = 6) {
    this.duration = duration;
    this.readyState = 1;
    this.dispatchEvent(new Event('loadedmetadata'));
  }

  finishSeek() {
    this.seeking = false;
    this.readyState = Math.max(2, this.readyState);
    this.dispatchEvent(new Event('seeked'));
  }

  paintFrame() {
    this.readyState = Math.max(2, this.readyState);
    const callbacks = [...this.frameCallbacks.values()];
    this.frameCallbacks.clear();
    for (const callback of callbacks) callback(0, { mediaTime: this.currentTime });
  }
}

function clipManifest(count = 2) {
  return {
    poster: null,
    clips: Array.from({ length: count }, (_, index) => ({
      src: `https://example.test/clip-${index + 1}.mp4`,
      duration: 6,
      frames: 180,
    })),
  };
}

function deferredPaint() {
  const callbacks = [];
  return {
    schedule(callback) {
      const entry = { callback, cancelled: false };
      callbacks.push(entry);
      return () => { entry.cancelled = true; };
    },
    flush() {
      for (const entry of callbacks.splice(0)) {
        if (!entry.cancelled) entry.callback();
      }
    },
  };
}

function posterState() {
  return { dataset: { active: 'true' } };
}

test('defers source assignment, remembers progress and waits for metadata before seeking', () => {
  const video = new FakeVideo();
  const paint = deferredPaint();
  const controller = createMediaController({
    videos: [video],
    manifest: clipManifest(),
    scheduleAfterPaint: paint.schedule,
  });

  controller.setProgress(0.1);
  assert.equal(video.src, '');
  assert.deepEqual(video.seekAssignments, []);

  paint.flush();
  assert.equal(video.src, 'https://example.test/clip-1.mp4');
  assert.deepEqual(video.seekAssignments, []);

  video.finishMetadata();
  assert.equal(video.seekAssignments.length, 1);
  assert.ok(Math.abs(video.seekAssignments[0] - 1.2) < 1e-9);
});

test('coalesces queued seeks and clamps the final frame to duration minus 1/30', () => {
  const video = new FakeVideo();
  const paint = deferredPaint();
  const controller = createMediaController({
    videos: [video],
    manifest: clipManifest(1),
    scheduleAfterPaint: paint.schedule,
  });

  controller.setProgress(0.2);
  paint.flush();
  video.finishMetadata();
  assert.equal(video.seekAssignments.length, 1);
  assert.ok(Math.abs(video.seekAssignments[0] - 1.2) < 1e-9);

  controller.setProgress(0.4);
  controller.setProgress(0.6);
  assert.equal(video.seekAssignments.length, 1, 'must not seek again while seeking');

  video.finishSeek();
  assert.equal(video.seekAssignments.length, 2, 'must apply only the latest queued target');
  assert.ok(Math.abs(video.seekAssignments[1] - 3.6) < 1e-9);
  video.finishSeek();

  controller.setProgress(1);
  assert.equal(video.seekAssignments.at(-1), 6 - FRAME);
});

test('loads and unloads only the current clip and direct neighbours in a five-clip chain', () => {
  const videos = [new FakeVideo(), new FakeVideo(), new FakeVideo()];
  const paint = deferredPaint();
  const controller = createMediaController({
    videos,
    manifest: clipManifest(5),
    scheduleAfterPaint: paint.schedule,
  });

  controller.setProgress(0.5);
  paint.flush();
  assert.deepEqual(
    videos.map(({ dataset }) => Number(dataset.clipIndex)).sort(),
    [1, 2, 3],
  );

  controller.setProgress(1);
  assert.deepEqual(
    videos
      .filter(({ src }) => src)
      .map(({ dataset }) => Number(dataset.clipIndex))
      .sort(),
    [3, 4],
  );
});

test('keeps the current Full layer until the incoming clip paints a frame', () => {
  const videos = [new FakeVideo(), new FakeVideo()];
  const poster = posterState();
  const paint = deferredPaint();
  const ready = [];
  const controller = createMediaController({
    videos,
    poster,
    manifest: clipManifest(),
    scheduleAfterPaint: paint.schedule,
    onReady(video, index) { ready.push([video, index]); },
  });

  controller.setProgress(0);
  paint.flush();
  videos[0].finishMetadata();
  videos[1].finishMetadata();
  videos[0].paintFrame();

  assert.equal(videos[0].dataset.active, 'true');
  assert.equal(poster.dataset.active, 'false');

  controller.setProgress(0.5);
  assert.equal(videos[0].dataset.active, 'true');
  assert.notEqual(videos[1].dataset.active, 'true');

  videos[1].paintFrame();
  assert.equal(videos[0].dataset.active, 'false');
  assert.equal(videos[1].dataset.active, 'true');
  assert.equal(ready.at(-1)[1], 1);
});

test('shows the poster while Lite replaces its single clip source', () => {
  const video = new FakeVideo();
  const poster = posterState();
  const paint = deferredPaint();
  const controller = createMediaController({
    videos: [video],
    poster,
    manifest: clipManifest(),
    scheduleAfterPaint: paint.schedule,
  });

  controller.setProgress(0);
  paint.flush();
  video.finishMetadata();
  video.paintFrame();
  assert.equal(video.dataset.active, 'true');
  assert.equal(poster.dataset.active, 'false');

  controller.setProgress(0.5);
  assert.equal(video.src, 'https://example.test/clip-2.mp4');
  assert.equal(video.dataset.active, 'false');
  assert.equal(poster.dataset.active, 'true');

  video.finishMetadata();
  video.paintFrame();
  assert.equal(video.dataset.active, 'true');
  assert.equal(poster.dataset.active, 'false');
});

test('remembers priming before metadata and retries a rejected play only on the next interaction', async () => {
  const video = new FakeVideo();
  const paint = deferredPaint();
  video.playResults.push(Promise.reject(new Error('gesture expired')), Promise.resolve());
  const controller = createMediaController({
    videos: [video],
    manifest: clipManifest(1),
    scheduleAfterPaint: paint.schedule,
  });

  controller.setProgress(0);
  paint.flush();
  await controller.prime();
  assert.equal(video.playCalls, 0, 'prime must remain queued before metadata');

  video.finishMetadata();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(video.playCalls, 1);

  video.dispatchEvent(new Event('loadeddata'));
  await Promise.resolve();
  assert.equal(video.playCalls, 1, 'a rejection must not retry without interaction');

  await controller.prime();
  assert.equal(video.playCalls, 2);
  assert.equal(video.pauseCalls, 1);

  await controller.prime();
  assert.equal(video.playCalls, 2, 'the successful prime must not replay on later interactions');
});

test('propagates synchronous seek and media errors without throwing from event handlers', () => {
  const seekVideo = new FakeVideo();
  const paint = deferredPaint();
  const errors = [];
  seekVideo.throwOnSeek = true;
  const controller = createMediaController({
    videos: [seekVideo],
    manifest: clipManifest(1),
    scheduleAfterPaint: paint.schedule,
    onError(error) { errors.push(error); },
  });

  controller.setProgress(0.4);
  paint.flush();
  assert.doesNotThrow(() => seekVideo.finishMetadata());
  assert.match(errors[0].message, /synchronous seek failure/);

  const mediaVideo = new FakeVideo();
  const mediaErrors = [];
  const secondPaint = deferredPaint();
  createMediaController({
    videos: [mediaVideo],
    manifest: clipManifest(1),
    scheduleAfterPaint: secondPaint.schedule,
    onError(error) { mediaErrors.push(error); },
  });
  secondPaint.flush();
  mediaVideo.dispatchEvent(new Event('error'));
  assert.equal(mediaErrors.length, 1);
});

test('uses an asynchronous source loader and releases loaded sources on destroy', async () => {
  const videos = [new FakeVideo(), new FakeVideo()];
  const paint = deferredPaint();
  const loaded = [];
  const released = [];
  const controller = createMediaController({
    videos,
    manifest: clipManifest(),
    scheduleAfterPaint: paint.schedule,
    async loadSource(clip, { signal }) {
      loaded.push({ src: clip.src, signal });
      return {
        src: `blob:${clip.src.split('/').at(-1)}`,
        release() { released.push(clip.src); },
      };
    },
  });

  controller.setProgress(0);
  paint.flush();
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(loaded.map(({ src }) => src), [
    'https://example.test/clip-1.mp4',
    'https://example.test/clip-2.mp4',
  ]);
  assert.equal(loaded.every(({ signal }) => signal instanceof AbortSignal), true);
  assert.deepEqual(videos.map(({ src }) => src), ['blob:clip-1.mp4', 'blob:clip-2.mp4']);

  controller.destroy();
  assert.deepEqual(released.sort(), [
    'https://example.test/clip-1.mp4',
    'https://example.test/clip-2.mp4',
  ]);
});

test('releases a source that finishes loading after the controller was destroyed', async () => {
  const video = new FakeVideo();
  const paint = deferredPaint();
  const released = [];
  let finishLoad;
  const pending = new Promise((resolve) => { finishLoad = resolve; });
  const controller = createMediaController({
    videos: [video],
    manifest: clipManifest(1),
    scheduleAfterPaint: paint.schedule,
    loadSource: () => pending,
  });

  controller.setProgress(0);
  paint.flush();
  controller.destroy();
  finishLoad({
    src: 'blob:late-clip',
    release() { released.push('blob:late-clip'); },
  });
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(released, ['blob:late-clip']);
  assert.equal(video.src, '');
});
