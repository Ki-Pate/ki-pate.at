import { DEMO_ROUTES, SCENES } from '../demos/shared/content.js';
import { expect, test } from './fixtures.mjs';

async function waitForDemo(page, slug) {
  const response = await page.goto(`/demos/${slug}/`);

  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('data-demo-id', slug);
  await expect(page.locator('html')).toHaveAttribute('data-frame-ready', 'true');
}

async function scrollToProgress(page, progress) {
  await page.evaluate((nextProgress) => {
    const track = document.querySelector('[data-scroll-track]');
    const top = window.scrollY + track.getBoundingClientRect().top;
    const distance = Math.max(1, track.scrollHeight - window.innerHeight);
    window.scrollTo({ top: top + distance * nextProgress, behavior: 'instant' });
  }, progress);
}

async function readIslandMotion(page) {
  return page.locator('[data-island-world]').evaluate((world) => {
    const worldStyle = getComputedStyle(world);
    const routeStyle = getComputedStyle(world.querySelector('.route-live'));

    return {
      cameraX: worldStyle.getPropertyValue('--camera-x').trim(),
      cameraY: worldStyle.getPropertyValue('--camera-y').trim(),
      cameraRx: worldStyle.getPropertyValue('--camera-rx').trim(),
      cameraRz: worldStyle.getPropertyValue('--camera-rz').trim(),
      routeProgress: worldStyle.getPropertyValue('--route-progress').trim(),
      routeDashOffset: routeStyle.strokeDashoffset,
    };
  });
}

test.describe('Final audit', () => {
  test('presents the server launcher as immediately actionable above the fold', async ({ page }) => {
    const response = await page.goto('/demos/');
    expect(response?.status()).toBe(200);
    await page.setViewportSize({ width: 1280, height: 720 });

    await expect(page.locator('.launcher-header .eyebrow')).toHaveText('SERVER-PREVIEW · ENTWURF');
    const actionBottoms = await page.locator('.demo-card .card-action').evaluateAll((actions) => (
      actions.map((action) => action.getBoundingClientRect().bottom)
    ));

    expect(actionBottoms).toHaveLength(DEMO_ROUTES.length);
    expect(actionBottoms.every((bottom) => bottom <= 720)).toBe(true);
  });

  test('cache-busts every demo stylesheet and entry script', async ({ page }) => {
    for (const path of ['/demos/', ...DEMO_ROUTES.map(({ slug }) => `/demos/${slug}/`)]) {
      await page.goto(path);
      const assetUrls = await page.locator('link[rel="stylesheet"], script[src]').evaluateAll((elements) => (
        elements
          .map((element) => element.href || element.src)
          .filter((url) => new URL(url).pathname.startsWith('/demos/'))
      ));

      expect(assetUrls.length, `${path}: no demo assets found`).toBeGreaterThan(0);
      for (const assetUrl of assetUrls) {
        expect(new URL(assetUrl).searchParams.get('v'), assetUrl).toMatch(/^\d{8}[a-z]$/);
      }
    }
  });

  test('keeps the primary CTA fully inside a short landscape viewport', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.addInitScript(() => sessionStorage.setItem('ki-pate-demo-mode', 'static'));

    for (const { slug } of DEMO_ROUTES) {
      await waitForDemo(page, slug);

      const cta = page.locator('.copy-zone [data-open-use-case]');
      await expect(cta).toBeVisible();
      const layout = await page.evaluate(() => {
        const rect = (selector) => document.querySelector(selector).getBoundingClientRect();
        const stage = rect('[data-demo-stage]');
        const copy = rect('.copy-zone');
        const toolbar = rect('.demo-toolbar');
        const navigation = rect('.scene-nav');
        const primaryCta = rect('.copy-zone [data-open-use-case]');
        const overlaps = (first, second) => !(
          first.right <= second.left
          || first.left >= second.right
          || first.bottom <= second.top
          || first.top >= second.bottom
        );

        return {
          stageHeight: stage.height,
          ctaTop: primaryCta.top,
          ctaBottom: primaryCta.bottom,
          ctaHeight: primaryCta.height,
          rendererStackLevel: getComputedStyle(document.querySelector('[data-renderer-stage]')).zIndex,
          rendererContainment: getComputedStyle(document.querySelector('[data-renderer-stage]')).contain,
          rendererIsolation: getComputedStyle(document.querySelector('[data-renderer-stage]')).isolation,
          rendererClipPath: getComputedStyle(document.querySelector('[data-renderer-stage]')).clipPath,
          rendererGroupStyle: getComputedStyle(document.querySelector('[data-renderer-stage] > *')).transformStyle,
          rendererNestedGroupStyle: document.querySelector('[data-floor], [data-island]')
            ? getComputedStyle(document.querySelector('[data-floor], [data-island]')).transformStyle
            : null,
          copyOverlapsToolbar: overlaps(copy, toolbar),
          copyOverlapsNavigation: overlaps(copy, navigation),
        };
      });

      expect(layout.stageHeight, `${slug}: stage exceeds the viewport`).toBeLessThanOrEqual(390);
      expect(layout.ctaHeight, `${slug}: CTA is smaller than the touch target`).toBeGreaterThanOrEqual(44);
      expect(layout.ctaTop, `${slug}: CTA starts above the viewport`).toBeGreaterThanOrEqual(0);
      expect(layout.ctaBottom, `${slug}: CTA is clipped below the viewport`).toBeLessThanOrEqual(390);
      expect(layout.rendererStackLevel, `${slug}: 3D renderer can paint above the CTA`).toBe('0');
      expect(layout.rendererContainment, `${slug}: 3D renderer lacks paint containment`).toContain('paint');
      expect(layout.rendererIsolation, `${slug}: 3D renderer lacks an isolated stack`).toBe('isolate');
      expect(layout.rendererClipPath, `${slug}: 3D renderer lacks a hard paint boundary`).not.toBe('none');
      if (slug !== 'arbeitsfluss') {
        expect(layout.rendererGroupStyle, `${slug}: nested 3D layers can escape the paint boundary`).toBe('flat');
        expect(layout.rendererNestedGroupStyle, `${slug}: inner 3D layers can escape the paint boundary`).toBe('flat');
      }
      expect(layout.copyOverlapsToolbar, `${slug}: copy overlaps the toolbar`).toBe(false);
      expect(layout.copyOverlapsNavigation, `${slug}: copy overlaps scene navigation`).toBe(false);
    }
  });

  test('uses auto scrolling when Reduced Motion changes after boot', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.addInitScript(() => {
      const nativeScrollTo = window.scrollTo;
      window.__scrollToCalls = [];
      window.scrollTo = function scrollTo(...args) {
        window.__scrollToCalls.push(args[0]);
        return nativeScrollTo.apply(window, args);
      };
    });
    await waitForDemo(page, 'betrieb-im-schnitt');

    await page.locator('[data-next-scene]').click();
    await expect.poll(() => page.evaluate(() => (
      window.__scrollToCalls.findLast((options) => options?.behavior)?.behavior
    ))).toBe('smooth');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'static');
    await page.evaluate(() => { window.__scrollToCalls.length = 0; });
    await page.locator('[data-next-scene]').click();

    await expect.poll(() => page.evaluate(() => (
      window.__scrollToCalls.findLast((options) => options?.behavior)?.behavior
    ))).toBe('auto');
  });

  test('shows the current problem in at most two lines at every mobile midpoint', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await waitForDemo(page, 'betrieb-im-schnitt');

    for (const [index, scene] of SCENES.entries()) {
      await scrollToProgress(page, (index + 0.5) / SCENES.length);
      await expect(page.locator('html')).toHaveAttribute('data-active-scene', scene.id);

      const problem = page.locator('[data-scene-problem]');
      await expect(problem).toBeVisible();
      await expect(problem).toHaveText(scene.problem);

      const layout = await problem.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const lineHeight = Number.parseFloat(style.lineHeight);
        const ctaRect = document.querySelector('.copy-zone [data-open-use-case]').getBoundingClientRect();
        const toolbarRect = document.querySelector('.demo-toolbar').getBoundingClientRect();
        const navRect = document.querySelector('.scene-nav').getBoundingClientRect();
        const overlaps = (first, second) => !(
          first.right <= second.left
          || first.left >= second.right
          || first.bottom <= second.top
          || first.top >= second.bottom
        );

        return {
          height: rect.height,
          lineHeight,
          insideViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
          beforeCta: rect.bottom <= ctaRect.top,
          ctaInsideViewport: ctaRect.top >= 0 && ctaRect.bottom <= window.innerHeight,
          overlapsCta: overlaps(rect, ctaRect),
          overlapsToolbar: overlaps(rect, toolbarRect),
          overlapsNavigation: overlaps(rect, navRect),
        };
      });

      expect(layout.height).toBeLessThanOrEqual(layout.lineHeight * 2 + 1);
      expect(layout.insideViewport).toBe(true);
      expect(layout.beforeCta).toBe(true);
      expect(layout.ctaInsideViewport).toBe(true);
      expect(layout.overlapsCta).toBe(false);
      expect(layout.overlapsToolbar).toBe(false);
      expect(layout.overlapsNavigation).toBe(false);
    }
  });

  test('names the interactive region for the current demo route', async ({ page }) => {
    for (const route of DEMO_ROUTES) {
      await waitForDemo(page, route.slug);
      await expect(page.locator('[data-scroll-track]')).toHaveAttribute(
        'aria-label',
        `Interaktive Demo: ${route.title}`,
      );
    }
  });

  test('keeps every Arbeitsfluss 3D group inside the renderer paint boundary', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await waitForDemo(page, 'arbeitsfluss');
    await scrollToProgress(page, 0.25);

    const transformStyles = await page.evaluate(() => (
      [...document.querySelectorAll('.workbench, .workbench-station')]
        .map((element) => getComputedStyle(element).transformStyle)
    ));

    expect(new Set(transformStyles)).toEqual(new Set(['flat']));
  });

  test('freezes rotation and route dash in Lite while Full keeps the routed camera', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => sessionStorage.setItem('ki-pate-demo-mode', 'lite'));
    await waitForDemo(page, 'use-case-inseln');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'lite');

    await scrollToProgress(page, 0.0833);
    await expect(page.locator('html')).toHaveAttribute('data-active-scene', 'chaos');
    const liteStart = await readIslandMotion(page);
    await scrollToProgress(page, 0.9167);
    await expect(page.locator('html')).toHaveAttribute('data-active-scene', 'control');
    const liteEnd = await readIslandMotion(page);

    expect([liteEnd.cameraX, liteEnd.cameraY]).not.toEqual([liteStart.cameraX, liteStart.cameraY]);
    expect(liteEnd.cameraRx).toBe(liteStart.cameraRx);
    expect(liteEnd.cameraRz).toBe(liteStart.cameraRz);
    expect(liteEnd.routeProgress).toBe(liteStart.routeProgress);
    expect(liteEnd.routeDashOffset).toBe(liteStart.routeDashOffset);

    await page.getByRole('button', { name: 'Full', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'full');
    await scrollToProgress(page, 0.0833);
    const fullStart = await readIslandMotion(page);
    await scrollToProgress(page, 0.75);
    const fullEnd = await readIslandMotion(page);

    expect([fullEnd.cameraRx, fullEnd.cameraRz]).not.toEqual([fullStart.cameraRx, fullStart.cameraRz]);
    expect(fullEnd.routeProgress).not.toBe(fullStart.routeProgress);
    expect(fullEnd.routeDashOffset).not.toBe(fullStart.routeDashOffset);
  });
});
