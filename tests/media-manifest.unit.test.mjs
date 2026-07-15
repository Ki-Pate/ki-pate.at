import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const EXPECTED_ASSETS = [
  {
    file: 'poster.webp',
    bytes: 26_110,
    sha256: '1C86F7BF950EF6FECB60F258F60542504F79B5379CA561F6BA731C415BD55D8F',
  },
  {
    file: 'clip-01.mp4',
    bytes: 1_918_006,
    sha256: '1C28CCCAA79F0F8F5EE2D6869862867C4E0E1AC74FCFA6301442D974C3CFD13F',
  },
  {
    file: 'clip-02.mp4',
    bytes: 1_996_736,
    sha256: '7FDB0E50E9F697F051E87501C256A827C3ED7BAA41ECA16973C85010C976B646',
  },
];

async function loadManifestModule() {
  try {
    return await import('../demos/shared/media-manifest.js');
  } catch {
    return null;
  }
}

test('resolves the approved Arbeitsfluss media and empty manifests for B and C', async () => {
  const module = await loadManifestModule();

  assert.equal(typeof module?.getMediaManifest, 'function', 'media manifest module is missing');

  const arbeitsfluss = module.getMediaManifest('arbeitsfluss');
  assert.equal(arbeitsfluss.poster.src.endsWith('/media/arbeitsfluss/poster.webp'), true);
  assert.deepEqual(
    arbeitsfluss.clips.map(({ src }) => new URL(src).pathname.split('/').at(-1)),
    ['clip-01.mp4', 'clip-02.mp4'],
  );
  assert.deepEqual(
    arbeitsfluss.clips.map(({ src }) => new URL(src).searchParams.get('v')),
    arbeitsfluss.clips.map(({ sha256 }) => sha256),
  );
  assert.deepEqual(module.getMediaManifest('betrieb-im-schnitt'), { poster: null, clips: [] });
  assert.deepEqual(module.getMediaManifest('use-case-inseln'), { poster: null, clips: [] });
});

test('matches the approved media byte sizes, hashes and manifest metadata', async () => {
  const module = await loadManifestModule();
  assert.equal(typeof module?.getMediaManifest, 'function', 'media manifest module is missing');

  const manifest = module.getMediaManifest('arbeitsfluss');
  const entries = [manifest.poster, ...manifest.clips];

  for (const [index, expected] of EXPECTED_ASSETS.entries()) {
    const path = join(PROJECT_ROOT, 'demos', 'media', 'arbeitsfluss', expected.file);
    let contents = null;

    try {
      contents = await readFile(path);
    } catch {
      // The assertion below reports a missing approved asset as an ordinary RED failure.
    }

    assert.ok(contents, `${expected.file} is missing`);
    assert.equal(contents.byteLength, expected.bytes, `${expected.file} byte size`);
    assert.equal(
      createHash('sha256').update(contents).digest('hex').toUpperCase(),
      expected.sha256,
      `${expected.file} SHA-256`,
    );
    assert.equal(entries[index].bytes, expected.bytes, `${expected.file} manifest bytes`);
    assert.equal(entries[index].sha256, expected.sha256, `${expected.file} manifest SHA-256`);
  }

  assert.deepEqual(
    manifest.clips.map(({ duration, frames }) => ({ duration, frames })),
    [{ duration: 6, frames: 180 }, { duration: 6, frames: 180 }],
  );
  assert.deepEqual(
    { width: manifest.poster.width, height: manifest.poster.height },
    { width: 720, height: 1280 },
  );
});
