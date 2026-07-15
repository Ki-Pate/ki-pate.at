import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DEMO_ROUTES, SCENES } from '../demos/shared/content.js';

const PROJECT_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DEFAULT_DEMOS_ROOT = join(PROJECT_ROOT, 'demos');

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderStaticSections() {
  return SCENES.map((scene) => {
    const exampleDay = scene.id === 'inbox'
      ? '\n      <p class="example-day">BEISPIELTAG</p>'
      : '';

    return `    <section class="static-scene" data-scene-id="${escapeHtml(scene.id)}">
      <p class="scene-label">${escapeHtml(scene.label)}</p>
      <h2>${escapeHtml(scene.headline)}</h2>${exampleDay}
      <p><strong>Ausgangslage:</strong> ${escapeHtml(scene.problem)}</p>
      <p><strong>Sichtbares Ergebnis:</strong> ${escapeHtml(scene.solution)}</p>
      <ul class="result-terms" aria-label="Ergebnismerkmale">
${scene.resultTerms.map((term) => `        <li>${escapeHtml(term)}</li>`).join('\n')}
      </ul>
    </section>`;
  }).join('\n\n');
}

function fillTemplate(template, route) {
  const firstScene = SCENES[0];
  const replacements = new Map([
    ['{{DEMO_ID}}', escapeHtml(route.slug)],
    ['{{DEMO_LABEL}}', escapeHtml(route.label)],
    ['{{TITLE}}', escapeHtml(route.title)],
    ['{{INITIAL_LABEL}}', escapeHtml(firstScene.label)],
    ['{{INITIAL_HEADLINE}}', escapeHtml(firstScene.headline)],
    ['{{INITIAL_PROBLEM}}', escapeHtml(firstScene.problem)],
    ['{{INITIAL_SOLUTION}}', escapeHtml(firstScene.solution)],
    ['{{STATIC_SECTIONS}}', renderStaticSections()],
  ]);

  let output = template;
  for (const [placeholder, value] of replacements) output = output.replaceAll(placeholder, value);

  if (/{{[A-Z_]+}}/.test(output)) throw new Error(`Unbekannter Template-Platzhalter in ${route.slug}.`);
  return output.endsWith('\n') ? output : `${output}\n`;
}

async function rendererExists(demosRoot, slug) {
  try {
    await access(join(demosRoot, slug, 'renderer.js'));
    return true;
  } catch {
    return false;
  }
}

export async function renderDemos({ demosRoot = DEFAULT_DEMOS_ROOT } = {}) {
  const resolvedDemosRoot = resolve(demosRoot);
  const template = await readFile(join(resolvedDemosRoot, 'template.html'), 'utf8');
  const generated = [];

  for (const route of DEMO_ROUTES) {
    if (!await rendererExists(resolvedDemosRoot, route.slug)) continue;

    const destination = join(resolvedDemosRoot, route.slug, 'index.html');
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, fillTemplate(template, route), 'utf8');
    generated.push(destination);
  }

  return generated;
}

const isDirectRun = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  const generated = await renderDemos();
  console.log(`Generated ${generated.length} demo route(s).`);
}
