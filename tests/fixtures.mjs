import { expect, test as base } from '@playwright/test';

export { expect };

export const test = base.extend({
  sharedContext: [async ({ browser }, use, workerInfo) => {
    const options = workerInfo.project.use;
    const context = await browser.newContext({
      baseURL: options.baseURL,
      viewport: options.viewport,
      userAgent: options.userAgent,
      deviceScaleFactor: options.deviceScaleFactor,
      isMobile: options.isMobile,
      hasTouch: options.hasTouch,
      locale: options.locale,
      colorScheme: options.colorScheme,
    });
    await use(context);
    await context.close();
  }, { scope: 'worker' }],

  page: async ({ sharedContext }, use) => {
    const page = await sharedContext.newPage();
    await use(page);
    await page.close();
  },
});
