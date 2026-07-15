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

export function createMediaController({
  videos = [],
  manifest,
  onReady = () => {},
  onError = () => {},
} = {}) {
  const videoList = Array.from(videos);
  const clips = getClips(manifest);
  const listeners = [];
  let destroyed = false;

  function assignClip(video, index) {
    const source = getSource(clips[index]);

    if (!source || video.dataset.clipIndex === String(index)) return;

    video.dataset.clipIndex = String(index);
    video.preload = 'metadata';
    video.src = source;
  }

  for (const [index, video] of videoList.entries()) {
    const ready = () => onReady(video, Number(video.dataset.clipIndex));
    const error = () => onError(video.error ?? new Error('Media konnte nicht geladen werden.'));

    video.addEventListener('loadeddata', ready);
    video.addEventListener('error', error);
    listeners.push([video, ready, error]);

    if (clips[index]) assignClip(video, index);
  }

  function setProgress(progress) {
    if (destroyed || clips.length === 0 || videoList.length === 0) return;

    const normalized = clamp01(progress);
    const index = Math.min(clips.length - 1, Math.floor(normalized * clips.length));
    const localProgress = normalized === 1 ? 1 : normalized * clips.length - index;
    const video = videoList.length === 1 ? videoList[0] : videoList[index % videoList.length];

    assignClip(video, index);

    for (const candidate of videoList) {
      candidate.dataset.active = String(candidate === video);
    }

    if (video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0) {
      const targetTime = localProgress * video.duration;
      if (Math.abs(video.currentTime - targetTime) > 1 / 30) video.currentTime = targetTime;
    }
  }

  async function prime() {
    if (destroyed) return;

    for (const video of videoList) {
      if (!video.src) continue;

      try {
        await video.play();
        video.pause();
      } catch {
        // A later user interaction can call prime() again.
      }
    }
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;

    for (const [video, ready, error] of listeners) {
      video.removeEventListener('loadeddata', ready);
      video.removeEventListener('error', error);
      video.pause();
      video.removeAttribute('src');
      video.removeAttribute('data-active');
      video.removeAttribute('data-clip-index');
      video.load();
    }
  }

  return { setProgress, prime, destroy };
}
