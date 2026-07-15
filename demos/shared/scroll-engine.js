import { SCENES } from './content.js';

function clamp01(value) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return 0;
  }

  return Math.max(0, Math.min(1, number));
}

function requirePositiveCount(count) {
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError('count must be a positive integer');
  }
}

export function getSceneState(progress) {
  const p = clamp01(progress);
  const index = Math.min(SCENES.length - 1, Math.floor(p * SCENES.length));
  return { ...SCENES[index], index, localProgress: p === 1 ? 1 : p * 6 - index };
}

export function getClipState(progress, count) {
  requirePositiveCount(count);

  const p = clamp01(progress);
  const index = Math.min(count - 1, Math.floor(p * count));

  return {
    index,
    progress: p === 1 ? 1 : p * count - index,
  };
}

export function getBufferWindow(index, count) {
  requirePositiveCount(count);

  if (!Number.isInteger(index) || index < 0 || index >= count) {
    throw new RangeError('index must identify an existing clip');
  }

  return [index - 1, index, index + 1].filter(
    (candidate) => candidate >= 0 && candidate < count,
  );
}

export function createScrollController({
  element,
  onFrame,
  clipCount = 2,
  view = globalThis.window,
  scrollBehavior = 'smooth',
} = {}) {
  requirePositiveCount(clipCount);

  if (typeof onFrame !== 'function') {
    throw new TypeError('onFrame must be a function');
  }

  if (!view || typeof view.requestAnimationFrame !== 'function') {
    throw new TypeError('A browser-like view is required');
  }

  const scrollElement = element ?? view.document?.documentElement;

  if (!scrollElement || typeof scrollElement.getBoundingClientRect !== 'function') {
    throw new TypeError('element must be a scroll container');
  }

  let startY = 0;
  let scrollDistance = 1;
  let targetProgress = 0;
  let frameId = null;
  let started = false;
  let measuredWidth = view.innerWidth;

  function measure() {
    const rect = scrollElement.getBoundingClientRect();
    const height = Math.max(
      scrollElement.scrollHeight ?? 0,
      scrollElement.offsetHeight ?? 0,
      rect.height ?? 0,
    );

    startY = view.scrollY + rect.top;
    scrollDistance = Math.max(1, height - view.innerHeight);
  }

  function readProgress() {
    targetProgress = clamp01((view.scrollY - startY) / scrollDistance);
  }

  function render() {
    frameId = null;
    const progress = targetProgress;

    onFrame({
      progress,
      scene: getSceneState(progress),
      clip: getClipState(progress, clipCount),
    });
  }

  function queueFrame() {
    if (frameId === null) {
      frameId = view.requestAnimationFrame(render);
    }
  }

  function handleScroll() {
    readProgress();
    queueFrame();
  }

  function remeasure() {
    const progress = targetProgress;
    measure();
    targetProgress = progress;
    view.scrollTo({ top: startY + scrollDistance * progress });
    queueFrame();
  }

  function handleResize() {
    if (view.innerWidth === measuredWidth) {
      return;
    }

    measuredWidth = view.innerWidth;
    remeasure();
  }

  function handleVisibilityChange() {
    if (view.document.hidden) {
      if (frameId !== null) {
        view.cancelAnimationFrame(frameId);
        frameId = null;
      }
      return;
    }

    readProgress();
    queueFrame();
  }

  function start() {
    if (started) {
      return;
    }

    started = true;
    measuredWidth = view.innerWidth;
    measure();
    readProgress();
    view.addEventListener('scroll', handleScroll, { passive: true });
    view.addEventListener('resize', handleResize);
    view.addEventListener('orientationchange', remeasure);
    view.document?.addEventListener('visibilitychange', handleVisibilityChange);
    queueFrame();
  }

  function stop() {
    if (!started) {
      return;
    }

    started = false;
    view.removeEventListener('scroll', handleScroll);
    view.removeEventListener('resize', handleResize);
    view.removeEventListener('orientationchange', remeasure);
    view.document?.removeEventListener('visibilitychange', handleVisibilityChange);

    if (frameId !== null) {
      view.cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  function scrollToScene(scene) {
    const index = typeof scene === 'string'
      ? SCENES.findIndex(({ id }) => id === scene)
      : scene;

    if (!Number.isInteger(index) || index < 0 || index >= SCENES.length) {
      throw new RangeError('scene must identify an existing scene');
    }

    if (!started) {
      measure();
    }

    targetProgress = (index + 0.5) / SCENES.length;
    view.scrollTo({
      top: startY + scrollDistance * targetProgress,
      behavior: scrollBehavior,
    });
    queueFrame();
  }

  return { start, stop, scrollToScene };
}
