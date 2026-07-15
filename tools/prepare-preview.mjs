import { copyFile, cp, mkdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import AdmZip from 'adm-zip';

import { renderDemos } from './render-demos.mjs';

const PROJECT_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const EXPECTED_PREVIEW_ROOT = join(PROJECT_ROOT, '.preview');
const SITE_FILES = [
  'index.html',
  'impressum.html',
  'datenschutz.html',
  'danke.html',
  'kontakt.php',
  'favicon.svg',
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
  'llms-full.txt',
];

export function assertPreviewTarget(target) {
  const resolvedTarget = resolve(target);

  if (resolvedTarget !== EXPECTED_PREVIEW_ROOT) {
    throw new Error(`Preview target must be exactly ${EXPECTED_PREVIEW_ROOT}.`);
  }

  return resolvedTarget;
}

export async function preparePreview({ target = EXPECTED_PREVIEW_ROOT } = {}) {
  const previewRoot = assertPreviewTarget(target);

  await rm(previewRoot, { recursive: true, force: true });
  await mkdir(previewRoot, { recursive: true });

  const archive = new AdmZip(join(PROJECT_ROOT, 'kipate-site.zip'));
  archive.extractAllTo(previewRoot, true);

  for (const file of SITE_FILES) {
    await copyFile(join(PROJECT_ROOT, file), join(previewRoot, file));
  }

  await cp(join(PROJECT_ROOT, 'demos'), join(previewRoot, 'demos'), { recursive: true });
  await renderDemos({ demosRoot: join(previewRoot, 'demos') });

  return previewRoot;
}

const isDirectRun = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  const target = process.env.PREVIEW_ROOT ?? EXPECTED_PREVIEW_ROOT;
  const previewRoot = await preparePreview({ target });
  console.log(`Prepared preview at ${previewRoot}`);
}
