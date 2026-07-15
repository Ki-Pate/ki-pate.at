import { expect, test } from '@playwright/test';

import { SCENES } from '../demos/shared/content.js';

const DEMO_PATH = '/demos/arbeitsfluss/';

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
    expect(await page.locator('#demo-shell').evaluate((element) => element.inert)).toBe(true);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    expect(await page.locator('#demo-shell').evaluate((element) => element.inert)).toBe(false);
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
      await expect(story.getByRole('link', { name: 'Meine Use Cases finden' })).toBeVisible();
      await expect(story.getByRole('link', { name: '30 Minuten KI-Sprechstunde' })).toBeVisible();
    } finally {
      await context.close();
    }
  });
});
