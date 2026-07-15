import { getBufferWindow, getClipState } from './scroll-engine.js';

const FRAME_EPSILON = 1 / 30;

function getClips(manifest) {
  if (Array.isArray(manifest)) return manifest;
  return Array.isArray(manifest?.clips) ? manifest.clips : [];
}

function getSource(clip) {
  if (typeof clip === 'string') return clip;
  return clip?.src ?? clip?.path ?? null;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function afterNextPaint(callback) {
  if (typeof globalThis.requestAnimationFrame !== 'function') {
    const timeout = setTimeout(callback, 0);
    return () => clearTimeout(timeout);
  }

  let secondFrame = null;
  const firstFrame = globalThis.requestAnimationFrame(() => {
    secondFrame = globalThis.requestAnimationFrame(callback);
  });

  return () => {
    globalThis.cancelAnimationFrame?.(firstFrame);
    if (secondFrame !== null) globalThis.cancelAnimationFrame?.(secondFrame);
  };
}

function desiredBuffer(index, count, capacity) {
  if (capacity === 1) return [index];

  const neighbours = getBufferWindow(index, count).filter((candidate) => candidate !== index);
  return [index, ...neighbours].slice(0, capacity);
}

export function createMediaController({
  videos = [],
  poster = null,
  manifest,
  onReady = () => {},
  onError = () => {},
  scheduleAfterPaint = afterNextPaint,
  loadSource = null,
} = {}) {
  const videoList = Array.from(videos);
  const clips = getClips(manifest);
  const states = videoList.map((video) => ({
    video,
    clipIndex: null,
    metadataReady: false,
    requestedTime: null,
    seeking: false,
    hasPaintedFrame: false,
    paintedTime: Number.NaN,
    frameCallbackId: null,
    frameToken: 0,
    primeStatus: 'idle',
    primeAttempts: 0,
    generation: 0,
    loadController: null,
    releaseSource: null,
  }));
  const listeners = [];
  let latestProgress = 0;
  let currentState = null;
  let sourcesEnabled = false;
  let primeRequested = false;
  let destroyed = false;
  let errorReported = false;
  let cancelSourceSchedule = null;

  function showPoster() {
    if (poster?.dataset) poster.dataset.active = 'true';
  }

  function hidePoster() {
    if (poster?.dataset) poster.dataset.active = 'false';
  }

  function reportError(error) {
    if (destroyed || errorReported) return;
    errorReported = true;
    onError(error instanceof Error ? error : new Error('Medium konnte nicht geladen werden.'));
  }

  function cancelFrameConfirmation(state) {
    state.frameToken += 1;
    if (
      state.frameCallbackId !== null
      && typeof state.video.cancelVideoFrameCallback === 'function'
    ) {
      state.video.cancelVideoFrameCallback(state.frameCallbackId);
    }
    state.frameCallbackId = null;
  }

  function discardSource(state) {
    const hadSource = Boolean(state.loadController || state.releaseSource || state.video.src);
    state.loadController?.abort();
    state.loadController = null;
    state.releaseSource?.();
    state.releaseSource = null;
    if (!hadSource) return;
    state.video.pause();
    state.video.removeAttribute('src');
    state.video.load();
  }

  function releaseState(state) {
    if (state.clipIndex === null) return;

    cancelFrameConfirmation(state);
    state.generation += 1;
    state.clipIndex = null;
    state.metadataReady = false;
    state.requestedTime = null;
    state.seeking = false;
    state.hasPaintedFrame = false;
    state.paintedTime = Number.NaN;
    state.primeStatus = 'idle';
    state.primeAttempts = 0;
    discardSource(state);
    state.video.removeAttribute('data-active');
    state.video.removeAttribute('data-clip-index');
  }

  function clampedTarget(state) {
    const duration = Number(state.video.duration);
    if (!Number.isFinite(duration) || duration <= 0 || state.requestedTime === null) return null;
    return Math.max(0, Math.min(state.requestedTime, Math.max(0, duration - FRAME_EPSILON)));
  }

  function isRequestedState(state) {
    if (clips.length === 0) return false;
    return getClipState(latestProgress, clips.length).index === state.clipIndex;
  }

  function commitPaintedState(state) {
    const target = clampedTarget(state);
    if (
      destroyed
      || target === null
      || !state.hasPaintedFrame
      || state.seeking
      || state.video.seeking
      || !isRequestedState(state)
      || Math.abs(state.paintedTime - target) > FRAME_EPSILON
    ) {
      return;
    }

    for (const candidate of states) {
      candidate.video.dataset.active = String(candidate === state);
    }
    currentState = state;
    hidePoster();
    onReady(state.video, state.clipIndex);

    const desired = desiredBuffer(state.clipIndex, clips.length, states.length);
    for (const candidate of states) {
      if (candidate !== currentState && !desired.includes(candidate.clipIndex)) {
        releaseState(candidate);
      }
    }
  }

  function markFramePainted(state, token) {
    if (destroyed || token !== state.frameToken) return;
    state.frameCallbackId = null;
    state.hasPaintedFrame = true;
    state.paintedTime = Number(state.video.currentTime) || 0;
    commitPaintedState(state);
  }

  function armFrameConfirmation(state) {
    cancelFrameConfirmation(state);
    state.hasPaintedFrame = false;
    state.paintedTime = Number.NaN;
    const token = state.frameToken;

    if (typeof state.video.requestVideoFrameCallback === 'function') {
      state.frameCallbackId = state.video.requestVideoFrameCallback(() => {
        markFramePainted(state, token);
      });
    }
  }

  function applyRequestedTarget(state) {
    if (destroyed || !state.metadataReady || state.requestedTime === null) return;
    if (state.seeking || state.video.seeking) return;

    const target = clampedTarget(state);
    if (target === null) return;

    if (Math.abs((Number(state.video.currentTime) || 0) - target) <= FRAME_EPSILON) {
      if (state.hasPaintedFrame) commitPaintedState(state);
      else if (state.frameCallbackId === null) armFrameConfirmation(state);
      return;
    }

    state.seeking = true;
    armFrameConfirmation(state);
    try {
      state.video.currentTime = target;
    } catch (error) {
      state.seeking = false;
      reportError(error);
    }
  }

  async function attemptPrime(state, fromInteraction) {
    if (destroyed || state.primeStatus === 'done' || state.primeStatus === 'failed') return;
    if (!state.metadataReady) {
      state.primeStatus = 'waiting-metadata';
      return;
    }
    if (state.primeStatus === 'attempting') return;
    if (state.primeStatus === 'retry-on-interaction' && !fromInteraction) return;

    const generation = state.generation;
    state.primeStatus = 'attempting';
    state.primeAttempts += 1;

    try {
      await state.video.play();
      if (destroyed || generation !== state.generation) return;
      state.video.pause();
      state.primeStatus = 'done';
    } catch {
      if (destroyed || generation !== state.generation) return;
      state.primeStatus = state.primeAttempts < 2 ? 'retry-on-interaction' : 'failed';
    }
  }

  function assignClip(state, index) {
    const source = getSource(clips[index]);
    if (!source || state.clipIndex === index) return;

    const wasActive = state === currentState || state.video.dataset.active === 'true';
    if (wasActive) {
      state.video.dataset.active = 'false';
      currentState = null;
      showPoster();
    }

    cancelFrameConfirmation(state);
    state.generation += 1;
    discardSource(state);
    state.clipIndex = index;
    state.metadataReady = false;
    state.requestedTime = null;
    state.seeking = false;
    state.hasPaintedFrame = false;
    state.paintedTime = Number.NaN;
    state.primeAttempts = 0;
    state.primeStatus = primeRequested ? 'waiting-metadata' : 'idle';
    state.video.dataset.clipIndex = String(index);
    state.video.dataset.active = 'false';
    state.video.preload = 'metadata';

    if (typeof loadSource !== 'function') {
      state.video.src = source;
      state.video.load?.();
      armFrameConfirmation(state);
      return;
    }

    const generation = state.generation;
    const controller = new AbortController();
    state.loadController = controller;
    Promise.resolve()
      .then(() => loadSource(clips[index], { signal: controller.signal }))
      .then((loaded) => {
        if (destroyed || state.generation !== generation) {
          loaded?.release?.();
          return;
        }
        if (!loaded?.src) throw new Error('Medium lieferte keine verwendbare Quelle.');

        state.loadController = null;
        state.releaseSource = loaded.release ?? null;
        state.video.src = loaded.src;
        state.video.load?.();
        armFrameConfirmation(state);
      })
      .catch((error) => {
        if (destroyed || state.generation !== generation || error?.name === 'AbortError') return;
        state.loadController = null;
        reportError(error);
      });
  }

  function ensureBuffer(index) {
    const desired = desiredBuffer(index, clips.length, states.length);
    const missing = desired.filter((clipIndex) => (
      !states.some((state) => state.clipIndex === clipIndex)
    ));
    const replaceable = states
      .filter((state) => !desired.includes(state.clipIndex))
      .sort((left, right) => Number(left === currentState) - Number(right === currentState));

    for (const clipIndex of missing) {
      const state = replaceable.shift();
      if (state) assignClip(state, clipIndex);
    }

    for (const state of states) {
      if (state !== currentState && !desired.includes(state.clipIndex)) releaseState(state);
    }

    return states.find((state) => state.clipIndex === index) ?? null;
  }

  function applyProgress() {
    if (destroyed || !sourcesEnabled || clips.length === 0 || states.length === 0) return;

    const clip = getClipState(latestProgress, clips.length);
    const state = ensureBuffer(clip.index);
    if (!state) return;

    state.requestedTime = clip.progress * (Number(clips[clip.index]?.duration) || 0);
    applyRequestedTarget(state);
  }

  function handleLoadedMetadata(state) {
    state.metadataReady = true;
    if (state.primeStatus === 'waiting-metadata') void attemptPrime(state, false);
    applyRequestedTarget(state);
  }

  function handleLoadedData(state) {
    if (typeof state.video.requestVideoFrameCallback !== 'function') {
      markFramePainted(state, state.frameToken);
    }
  }

  function handleSeeked(state) {
    state.seeking = false;
    const target = clampedTarget(state);

    if (
      target !== null
      && Math.abs((Number(state.video.currentTime) || 0) - target) > FRAME_EPSILON
    ) {
      applyRequestedTarget(state);
      return;
    }

    if (typeof state.video.requestVideoFrameCallback !== 'function') {
      markFramePainted(state, state.frameToken);
    } else {
      commitPaintedState(state);
    }
  }

  for (const state of states) {
    const { video } = state;
    const loadedMetadata = () => handleLoadedMetadata(state);
    const loadedData = () => handleLoadedData(state);
    const seeked = () => handleSeeked(state);
    const error = () => reportError(video.error ?? new Error('Medium konnte nicht geladen werden.'));

    video.addEventListener('loadedmetadata', loadedMetadata);
    video.addEventListener('loadeddata', loadedData);
    video.addEventListener('seeked', seeked);
    video.addEventListener('error', error);
    listeners.push({ video, loadedMetadata, loadedData, seeked, error, state });
  }

  if (clips.length > 0 && states.length > 0) {
    cancelSourceSchedule = scheduleAfterPaint(() => {
      cancelSourceSchedule = null;
      if (destroyed) return;
      sourcesEnabled = true;
      applyProgress();
    });
  }

  function setProgress(progress) {
    latestProgress = clamp01(progress);
    applyProgress();
  }

  async function prime() {
    if (destroyed) return;
    primeRequested = true;
    await Promise.all(states.map((state) => attemptPrime(state, true)));
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cancelSourceSchedule?.();
    cancelSourceSchedule = null;

    for (const { video, loadedMetadata, loadedData, seeked, error, state } of listeners) {
      cancelFrameConfirmation(state);
      video.removeEventListener('loadedmetadata', loadedMetadata);
      video.removeEventListener('loadeddata', loadedData);
      video.removeEventListener('seeked', seeked);
      video.removeEventListener('error', error);
      discardSource(state);
      video.removeAttribute('data-active');
      video.removeAttribute('data-clip-index');
    }
    showPoster();
  }

  return { setProgress, prime, destroy };
}
