import assert from 'node:assert/strict';
import test from 'node:test';

async function loadModule() {
  try {
    return await import('../demos/shared/media-loader.js');
  } catch {
    return null;
  }
}

test('fetches one complete clip and exposes an idempotent Blob URL release', async () => {
  const module = await loadModule();
  assert.equal(typeof module?.createBlobClipLoader, 'function', 'blob clip loader is missing');

  const calls = [];
  const revoked = [];
  const blob = new Blob(['approved clip']);
  const signal = new AbortController().signal;
  const loadClip = module.createBlobClipLoader({
    async fetchImpl(src, options) {
      calls.push({ src, options });
      return { ok: true, status: 200, blob: async () => blob };
    },
    urlApi: {
      createObjectURL(value) {
        assert.equal(value, blob);
        return 'blob:approved-clip';
      },
      revokeObjectURL(src) { revoked.push(src); },
    },
  });

  const loaded = await loadClip({ src: '/clip-01.mp4' }, { signal });
  assert.deepEqual(calls, [{
    src: '/clip-01.mp4',
    options: { cache: 'force-cache', signal },
  }]);
  assert.equal(loaded.src, 'blob:approved-clip');

  loaded.release();
  loaded.release();
  assert.deepEqual(revoked, ['blob:approved-clip']);
});

test('rejects an unsuccessful clip fetch without creating a Blob URL', async () => {
  const module = await loadModule();
  assert.equal(typeof module?.createBlobClipLoader, 'function', 'blob clip loader is missing');
  let created = false;
  const loadClip = module.createBlobClipLoader({
    fetchImpl: async () => ({ ok: false, status: 503 }),
    urlApi: {
      createObjectURL() { created = true; },
      revokeObjectURL() {},
    },
  });

  await assert.rejects(() => loadClip({ src: '/clip-01.mp4' }), /503/);
  assert.equal(created, false);
});
