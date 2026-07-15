import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DEMO_ROUTES, SCENES } from '../demos/shared/content.js';

const DEMO_PATH = '/demos/arbeitsfluss/';
const PROJECT_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

async function openArbeitsfluss(page) {
  const response = await page.goto(DEMO_PATH);

  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('data-demo-id', 'arbeitsfluss');
  await expect(page.locator('html')).toHaveAttribute('data-frame-ready', 'true');
}

test.describe('Arbeitsfluss', () => {
  test('serves the generated route with HTML MIME and a route sentinel', async ({ request }) => {
    const response = await request.get(DEMO_PATH);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
    expect(await response.text()).toContain('data-demo-id="arbeitsfluss"');

    const missing = await request.get('/demos/__missing__/');
    expect(missing.status()).toBe(404);
  });

  test('loads without console errors or failed resource responses', async ({ page }) => {
    const consoleErrors = [];
    const failedResponses = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
    });

    await openArbeitsfluss(page);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
    expect(consoleErrors).toEqual([]);
    expect(failedResponses).toEqual([]);
  });

  test('renders all canonical headings and activates every timeline midpoint', async ({ page }) => {
    await openArbeitsfluss(page);

    const staticHeadings = page.locator('[data-static-story] [data-scene-id] h2');
    await expect(staticHeadings).toHaveCount(SCENES.length);
    await expect(staticHeadings).toHaveText(SCENES.map(({ headline }) => headline));

    for (const [index, scene] of SCENES.entries()) {
      const midpoint = (index + 0.5) / SCENES.length;

      await page.evaluate((progress) => {
        const track = document.querySelector('[data-scroll-track]');
        const top = window.scrollY + track.getBoundingClientRect().top;
        const distance = Math.max(1, track.scrollHeight - window.innerHeight);
        window.scrollTo({ top: top + distance * progress, behavior: 'instant' });
      }, midpoint);

      await expect.poll(
        () => page.locator('html').getAttribute('data-active-scene'),
        { timeout: 250 },
      ).toBe(scene.id);
    }
  });

  test('has no horizontal overflow at the supported widths', async ({ page }) => {
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
      await openArbeitsfluss(page);

      const overflow = await page.evaluate(() => Math.max(
        document.documentElement.scrollWidth,
        document.body.scrollWidth,
      ) - document.documentElement.clientWidth);

      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
  });

  test('moves focus into the native dialog and returns it after Escape', async ({ page }) => {
    await openArbeitsfluss(page);

    const trigger = page.getByRole('button', { name: 'Meine Use Cases finden' });
    const dialog = page.getByRole('dialog', { name: 'Mini Use-Case-Check' });
    const firstChoice = dialog.getByRole('checkbox', { name: 'E-Mail' });

    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(firstChoice).toBeFocused();
    expect(await page.locator('#page-content').evaluate((element) => element.inert)).toBe(true);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    expect(await page.locator('#page-content').evaluate((element) => element.inert)).toBe(false);
  });

  test('opens the dialog from the static primary CTA while preserving its no-JS href', async ({ page }) => {
    await openArbeitsfluss(page);

    const hrefBefore = page.url();
    const trigger = page.locator('[data-static-story]').getByRole('link', { name: 'Meine Use Cases finden' });
    await expect(trigger).toHaveAttribute('href', '../../index.html#kontakt');
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: 'Mini Use-Case-Check' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('checkbox', { name: 'E-Mail' })).toBeFocused();
    expect(page.url()).toBe(hrefBefore);

    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });

  test('contains focus when the native dialog API is unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
        configurable: true,
        value: undefined,
      });
    });
    await openArbeitsfluss(page);
    await page.getByRole('button', { name: 'Meine Use Cases finden' }).click();

    const dialog = page.getByRole('dialog', { name: 'Mini Use-Case-Check' });
    const closeButton = dialog.getByRole('button', { name: 'Dialog schließen' });
    const lastLink = dialog.getByRole('link', { name: 'Ergebnis in der KI-Sprechstunde prüfen' });
    expect(await page.locator('#page-content').evaluate((element) => element.inert)).toBe(true);

    await lastLink.focus();
    await page.keyboard.press('Tab');
    await expect(closeButton).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    expect(await page.locator('#page-content').evaluate((element) => element.inert)).toBe(false);
  });

  test('calculates the approved vectors and shows validation errors', async ({ page }) => {
    await openArbeitsfluss(page);
    await page.getByRole('button', { name: 'Meine Use Cases finden' }).click();

    const dialog = page.getByRole('dialog', { name: 'Mini Use-Case-Check' });
    const submit = dialog.getByRole('button', { name: 'Potenzial prüfen' });
    const hours = dialog.getByLabel('Verlorene Teamstunden pro Woche');
    const error = dialog.locator('[data-calculator-error]');
    const result = dialog.locator('[data-calculator-result]');

    await submit.click();
    await expect(error).toContainText('Wählen Sie mindestens einen Bereich');

    await dialog.getByRole('checkbox', { name: 'E-Mail' }).check();
    await hours.fill('10');
    await submit.click();
    await expect(result).toContainText('92–184 Stunden/Jahr');

    await hours.fill('20');
    await submit.click();
    await expect(result).toContainText('184–368 Stunden/Jahr');

    for (const invalid of ['0', '81']) {
      await hours.fill(invalid);
      await submit.click();
      await expect(error).toContainText('ganze Zahl von 1 bis 80');
    }

    await hours.fill('');
    await hours.pressSequentially('abc');
    await expect(hours).toHaveValue('');
    await submit.click();
    await expect(error).toContainText('ganze Zahl von 1 bis 80');
  });

  test('does not request, navigate or persist calculator input', async ({ page }) => {
    await openArbeitsfluss(page);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Meine Use Cases finden' }).click();

    const before = await page.evaluate(() => ({
      href: location.href,
      historyLength: history.length,
      localStorage: JSON.stringify({ ...localStorage }),
      sessionStorage: JSON.stringify({ ...sessionStorage }),
    }));
    const requests = [];
    page.on('request', (request) => requests.push(request.url()));

    const dialog = page.getByRole('dialog', { name: 'Mini Use-Case-Check' });
    await dialog.getByRole('checkbox', { name: 'Angebote' }).check();
    await dialog.getByLabel('Verlorene Teamstunden pro Woche').fill('10');
    await dialog.getByRole('button', { name: 'Potenzial prüfen' }).click();
    await expect(dialog.locator('[data-calculator-result]')).toContainText('92–184 Stunden/Jahr');
    await page.waitForTimeout(50);

    const after = await page.evaluate(() => ({
      href: location.href,
      historyLength: history.length,
      localStorage: JSON.stringify({ ...localStorage }),
      sessionStorage: JSON.stringify({ ...sessionStorage }),
    }));

    expect(requests).toEqual([]);
    expect(after).toEqual(before);
  });

  test('uses Static for Reduced Motion without MP4 requests', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const mp4Requests = [];
    page.on('request', (request) => {
      if (request.url().endsWith('.mp4')) mp4Requests.push(request.url());
    });

    await openArbeitsfluss(page);

    await expect(page.locator('html')).toHaveAttribute('data-mode', 'static');
    await expect(page.locator('html')).toHaveAttribute('data-mode-reason', 'reduced-motion');
    await expect(page.locator('video[src]')).toHaveCount(0);
    expect(await page.locator('[data-scroll-track]').evaluate((track) => (
      track.scrollHeight / window.innerHeight
    ))).toBeLessThanOrEqual(1.05);
    expect(mp4Requests).toEqual([]);
  });

  test('requires current-page consent before honoring a saved mode with Save-Data', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'connection', {
        configurable: true,
        value: { saveData: true },
      });
      sessionStorage.setItem('ki-pate-demo-mode', 'lite');
    });
    const mp4Requests = [];
    page.on('request', (request) => {
      if (request.url().endsWith('.mp4')) mp4Requests.push(request.url());
    });

    await openArbeitsfluss(page);

    const consent = page.getByRole('button', { name: 'Trotz Datensparmodus laden' });
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'static');
    await expect(page.locator('html')).toHaveAttribute('data-mode-reason', 'save-data');
    await expect(consent).toBeVisible();
    expect(await page.locator('[data-scroll-track]').evaluate((track) => (
      track.scrollHeight / window.innerHeight
    ))).toBeLessThanOrEqual(1.05);
    expect(mp4Requests).toEqual([]);

    await consent.click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'lite');
    await expect(consent).toBeHidden();
    expect(await page.locator('[data-scroll-track]').evaluate((track) => (
      track.scrollHeight / window.innerHeight
    ))).toBeGreaterThanOrEqual(5.9);
  });

  test('makes Full and Lite structurally observable', async ({ page }) => {
    await openArbeitsfluss(page);

    await expect(page.locator('html')).toHaveAttribute('data-mode', 'full');
    await expect(page.locator('[data-media-layer] video')).toHaveCount(2);
    const fullParticleCount = await page.locator('[data-particles] .particle').count();
    expect(fullParticleCount).toBeGreaterThan(0);
    expect(fullParticleCount).toBeLessThanOrEqual(24);

    await page.getByRole('button', { name: 'Lite', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'lite');
    await expect(page.locator('[data-media-layer] video')).toHaveCount(1);
    await expect(page.locator('[data-particles] .particle')).toHaveCount(0);

    const filteredElements = await page.locator('.demo-stage *').evaluateAll((elements) => elements
      .filter((element) => {
        const style = getComputedStyle(element);
        return style.filter !== 'none' || style.backdropFilter !== 'none';
      })
      .map((element) => element.tagName));
    expect(filteredElements).toEqual([]);
  });

  test('keeps all scenes and both CTAs readable without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();

    try {
      const response = await page.goto(DEMO_PATH);
      expect(response?.status()).toBe(200);

      const story = page.locator('[data-static-story]');
      await expect(story.locator('[data-scene-id] h2')).toHaveText(
        SCENES.map(({ headline }) => headline),
      );
      await expect(story.locator('[data-scene-id="inbox"]').getByText('BEISPIELTAG', { exact: true })).toBeVisible();
      await expect(story.getByRole('link', { name: 'Meine Use Cases finden' })).toBeVisible();
      await expect(story.getByRole('link', { name: '30 Minuten KI-Sprechstunde' })).toBeVisible();
    } finally {
      await context.close();
    }
  });
});

test.describe('Arbeitsfluss media', () => {
  test('serves exact byte ranges for the approved MP4', async ({ request }) => {
    const response = await request.get('/demos/media/arbeitsfluss/clip-01.mp4', {
      headers: { Range: 'bytes=100-199' },
    });
    const source = await readFile(join(
      PROJECT_ROOT,
      'demos',
      'media',
      'arbeitsfluss',
      'clip-01.mp4',
    ));

    expect(response.status()).toBe(206);
    expect(response.headers()['content-range']).toBe('bytes 100-199/1918006');
    expect(response.headers()['content-length']).toBe('100');
    expect(Buffer.from(await response.body())).toEqual(source.subarray(100, 200));
  });

  test('loads the Full poster first and requests both clips only after document boot', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const mp4Requests = [];
    let documentBooted = false;

    page.on('domcontentloaded', () => { documentBooted = true; });
    page.on('request', (request) => {
      if (request.url().includes('/demos/media/arbeitsfluss/') && request.url().endsWith('.mp4')) {
        mp4Requests.push({ url: request.url(), afterBoot: documentBooted });
      }
    });

    try {
      await openArbeitsfluss(page);
      const poster = page.locator('[data-media-poster]');
      await expect(poster).toBeVisible();
      await expect(poster).toHaveAttribute('fetchpriority', 'high');
      await expect(page.locator('[data-media-layer] video')).toHaveCount(2);
      await expect.poll(() => new Set(mp4Requests.map(({ url }) => url)).size).toBe(2);

      expect(mp4Requests.every(({ afterBoot }) => afterBoot)).toBe(true);
      expect(new Set(mp4Requests.map(({ url }) => new URL(url).pathname))).toEqual(new Set([
        '/demos/media/arbeitsfluss/clip-01.mp4',
        '/demos/media/arbeitsfluss/clip-02.mp4',
      ]));
    } finally {
      await context.close();
    }
  });

  test('uses fresh cold starts with zero MP4 requests when media is disallowed or absent', async ({ browser }) => {
    async function coldStart({ path, mode, reducedMotion, saveData = false }) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      const mp4Requests = new Set();

      if (reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' });
      if (mode || saveData) {
        await page.addInitScript(({ selectedMode, useSaveData }) => {
          if (selectedMode) sessionStorage.setItem('ki-pate-demo-mode', selectedMode);
          if (useSaveData) {
            Object.defineProperty(navigator, 'connection', {
              configurable: true,
              value: { saveData: true },
            });
          }
        }, { selectedMode: mode, useSaveData: saveData });
      }
      page.on('request', (request) => {
        if (request.url().endsWith('.mp4')) mp4Requests.add(request.url());
      });

      try {
        await page.goto(path);
        await expect(page.locator('html')).toHaveAttribute('data-frame-ready', 'true');
        await page.waitForTimeout(300);
        return {
          mode: await page.locator('html').getAttribute('data-mode'),
          videoCount: await page.locator('[data-media-layer] video').count(),
          requests: [...mp4Requests],
        };
      } finally {
        await context.close();
      }
    }

    for (const scenario of [
      { path: DEMO_PATH, mode: 'static' },
      { path: DEMO_PATH, reducedMotion: true },
      { path: DEMO_PATH, mode: 'lite', saveData: true },
      { path: '/demos/betrieb-im-schnitt/' },
      { path: '/demos/betrieb-im-schnitt/', mode: 'lite' },
      { path: '/demos/use-case-inseln/' },
      { path: '/demos/use-case-inseln/', mode: 'lite' },
    ]) {
      const result = await coldStart(scenario);
      expect(result.requests, JSON.stringify(scenario)).toEqual([]);
      expect(result.videoCount, JSON.stringify(scenario)).toBe(0);
    }
  });

  test('keeps a painted layer visible while delayed clip 2 crosses the boundary and when reversing', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    let releaseClip2;
    const clip2Gate = new Promise((resolve) => { releaseClip2 = resolve; });
    let clip2Requested = false;

    await page.route('**/clip-02.mp4', async (route) => {
      clip2Requested = true;
      await clip2Gate;
      await route.continue();
    });

    async function scrollTo(progress) {
      await page.evaluate((nextProgress) => {
        const track = document.querySelector('[data-scroll-track]');
        const top = window.scrollY + track.getBoundingClientRect().top;
        const distance = Math.max(1, track.scrollHeight - window.innerHeight);
        window.scrollTo({ top: top + distance * nextProgress, behavior: 'instant' });
      }, progress);
    }

    try {
      await openArbeitsfluss(page);
      await expect.poll(() => clip2Requested).toBe(true);
      await expect(page.locator('video[data-clip-index="0"][data-active="true"]')).toHaveCount(1);

      await scrollTo(0.51);
      await expect(page.locator('video[data-clip-index="0"][data-active="true"]')).toHaveCount(1);
      await expect(page.locator('[data-media-poster][data-active="true"]')).toHaveCount(0);

      releaseClip2();
      await expect(page.locator('video[data-clip-index="1"][data-active="true"]')).toHaveCount(1);

      await scrollTo(0.49);
      await expect(page.locator('video[data-clip-index="0"][data-active="true"]')).toHaveCount(1);
    } finally {
      releaseClip2();
      await context.close();
    }
  });

  test('falls back to Static on a media error without logging a console error', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await openArbeitsfluss(page);
    const video = page.locator('[data-media-layer] video').first();
    await expect(video).toHaveCount(1);
    await video.evaluate((element) => element.dispatchEvent(new Event('error')));

    await expect(page.locator('html')).toHaveAttribute('data-mode', 'static');
    await expect(page.locator('html')).toHaveAttribute('data-mode-reason', 'media-error');
    await expect(page.locator('[data-media-layer] video')).toHaveCount(0);
    await expect(page.locator('[data-media-poster]')).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});

test.describe('Varianten', () => {
  const expectedStory = SCENES.map((scene) => ({
    id: scene.id,
    label: scene.label,
    headline: scene.headline,
    problem: `Ausgangslage: ${scene.problem}`,
    solution: `Sichtbares Ergebnis: ${scene.solution}`,
    resultTerms: scene.resultTerms,
  }));

  test('links all three testable routes from the demo launcher', async ({ page }) => {
    const response = await page.goto('/demos/');

    expect(response?.status()).toBe(200);
    await expect(page.locator('.demo-card')).toHaveCount(DEMO_ROUTES.length);

    for (const route of DEMO_ROUTES) {
      const card = page.locator('.demo-card').filter({ hasText: route.title });
      await expect(card.locator('.eyebrow')).toHaveText(`${route.label} · TESTBAR`);
      await expect(card.getByRole('link')).toHaveAttribute('href', `./${route.slug}/`);
    }
  });

  test('serves canonical scenes and calculator configuration on every route', async ({ page }) => {
    for (const route of DEMO_ROUTES) {
      const response = await page.goto(`/demos/${route.slug}/`);

      expect(response?.status(), route.slug).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('data-demo-id', route.slug);
      await expect(page.locator('html')).toHaveAttribute('data-frame-ready', 'true');

      const story = await page.locator('[data-static-story] [data-scene-id]').evaluateAll((sections) => (
        sections.map((section) => {
          const paragraphs = Array.from(section.querySelectorAll(':scope > p'));
          return {
            id: section.dataset.sceneId,
            label: section.querySelector('.scene-label')?.textContent.trim(),
            headline: section.querySelector('h2')?.textContent.trim(),
            problem: paragraphs.find((paragraph) => paragraph.querySelector('strong')?.textContent === 'Ausgangslage:')?.textContent.trim(),
            solution: paragraphs.find((paragraph) => paragraph.querySelector('strong')?.textContent === 'Sichtbares Ergebnis:')?.textContent.trim(),
            resultTerms: Array.from(section.querySelectorAll('.result-terms li'), (item) => item.textContent.trim()),
          };
        })
      ));
      expect(story, route.slug).toEqual(expectedStory);

      const calculator = await page.locator('#use-case-dialog').evaluate((dialog) => ({
        choices: Array.from(dialog.querySelectorAll('input[name="useCases"]'), (input) => input.value),
        hours: (() => {
          const input = dialog.querySelector('#weekly-hours');
          return {
            inputmode: input.getAttribute('inputmode'),
            min: input.getAttribute('min'),
            max: input.getAttribute('max'),
            step: input.getAttribute('step'),
          };
        })(),
        submit: dialog.querySelector('button[type="submit"]')?.textContent.trim(),
        consultationHref: dialog.querySelector('a.secondary-action')?.getAttribute('href'),
      }));
      expect(calculator, route.slug).toEqual({
        choices: ['E-Mail', 'Angebote', 'Meetings', 'Firmenwissen'],
        hours: { inputmode: 'numeric', min: '1', max: '80', step: '1' },
        submit: 'Potenzial prüfen',
        consultationHref: '../../index.html#kontakt',
      });
    }
  });

  test('mounts six technical floors around one service core in variant B', async ({ page }) => {
    await page.goto('/demos/betrieb-im-schnitt/');
    await expect(page.locator('[data-building-stack] [data-floor]')).toHaveCount(6);
    await expect(page.locator('[data-service-core]')).toHaveCount(1);

    const initialCamera = await page.locator('[data-building-stack]').evaluate((building) => ({
      y: building.style.getPropertyValue('--camera-y'),
      z: building.style.getPropertyValue('--camera-z'),
    }));
    await page.locator('[data-next-scene]').click();
    await expect(page.locator('html')).toHaveAttribute('data-active-scene', 'inbox');
    const nextCamera = await page.locator('[data-building-stack]').evaluate((building) => ({
      y: building.style.getPropertyValue('--camera-y'),
      z: building.style.getPropertyValue('--camera-z'),
    }));

    expect(nextCamera.y).not.toBe(initialCamera.y);
    expect(nextCamera.z).not.toBe(initialCamera.z);
  });

  test('mounts six routed machine islands with fixed camera keyframes in variant C', async ({ page }) => {
    await page.goto('/demos/use-case-inseln/');
    await expect(page.locator('[data-island-world] [data-island]')).toHaveCount(6);
    await expect(page.locator('[data-island-route]')).toHaveCount(1);

    const firstCamera = await page.locator('[data-island-world]').evaluate((world) => ({
      x: world.style.getPropertyValue('--camera-x'),
      y: world.style.getPropertyValue('--camera-y'),
      z: world.style.getPropertyValue('--camera-z'),
    }));
    await page.locator('[data-next-scene]').click();
    await expect(page.locator('html')).toHaveAttribute('data-active-scene', 'inbox');
    const secondCamera = await page.locator('[data-island-world]').evaluate((world) => ({
      x: world.style.getPropertyValue('--camera-x'),
      y: world.style.getPropertyValue('--camera-y'),
      z: world.style.getPropertyValue('--camera-z'),
    }));

    expect(secondCamera).not.toEqual(firstCamera);
  });

  test('keeps each active machine inside the mobile cinematic safe zone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const { slug, selector } of [
      { slug: 'betrieb-im-schnitt', selector: '[data-floor][data-active="true"]' },
      { slug: 'use-case-inseln', selector: '[data-island][data-active="true"]' },
    ]) {
      await page.goto(`/demos/${slug}/`);
      const copy = await page.locator('.copy-zone').boundingBox();

      expect(copy, slug).not.toBeNull();

      for (const [index, scene] of SCENES.entries()) {
        await page.evaluate((progress) => {
          const track = document.querySelector('[data-scroll-track]');
          const top = window.scrollY + track.getBoundingClientRect().top;
          const distance = Math.max(1, track.scrollHeight - window.innerHeight);
          window.scrollTo({ top: top + distance * progress, behavior: 'instant' });
        }, (index + 0.5) / SCENES.length);
        await expect(page.locator('html')).toHaveAttribute('data-active-scene', scene.id);

        const visual = await page.locator(selector).boundingBox();
        const label = `${slug}:${scene.id}`;
        expect(visual, label).not.toBeNull();
        expect(visual.x, label).toBeGreaterThanOrEqual(10);
        expect(visual.x + visual.width, label).toBeLessThanOrEqual(380);
        expect(visual.y, label).toBeGreaterThanOrEqual(176);
        expect(visual.y + visual.height, label).toBeLessThanOrEqual(copy.y - 12);
      }
    }
  });

  test('keeps canonical content out of the variant renderer modules', async ({ request }) => {
    for (const slug of ['betrieb-im-schnitt', 'use-case-inseln']) {
      const response = await request.get(`/demos/${slug}/renderer.js`);
      expect(response.status(), slug).toBe(200);
      expect(await response.text(), slug).not.toContain('content.js');
    }
  });
});
