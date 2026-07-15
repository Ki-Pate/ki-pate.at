export function createBlobClipLoader({
  fetchImpl = globalThis.fetch,
  urlApi = globalThis.URL,
} = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('fetchImpl must be a function');
  if (typeof urlApi?.createObjectURL !== 'function') throw new TypeError('urlApi must create Blob URLs');

  return async function loadClip(clip, { signal } = {}) {
    const response = await fetchImpl(clip.src, { cache: 'force-cache', signal });
    if (!response.ok) throw new Error(`Medium konnte nicht geladen werden (${response.status}).`);

    const source = urlApi.createObjectURL(await response.blob());
    let released = false;

    return {
      src: source,
      release() {
        if (released) return;
        released = true;
        urlApi.revokeObjectURL(source);
      },
    };
  };
}
