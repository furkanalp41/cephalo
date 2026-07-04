import { test, expect } from '@playwright/test';

// G19 — playwright-no-net (ship-blocking e2e). The offline instrument must make ZERO
// non-localhost requests across a full tour (boot + every v2 arsenal surface). We
// intercept EVERY request and record any whose URL is not same-origin (localhost) /
// data: / blob:; the app still works (we continue all requests) but the tour must end
// with an empty offending list.
test.describe('G19 — no runtime network', () => {
  test('a full tour (boot → ask → advisor → cve → arsenal) makes no non-localhost request', async ({ page }) => {
    const offending: string[] = [];
    await page.route('**', (route) => {
      const url = route.request().url();
      if (!/^(https?:\/\/localhost(:\d+)?\/|data:|blob:)/.test(url)) offending.push(url);
      return route.continue();
    });

    for (const path of ['/#/', '/#/ask', '/#/advisor', '/#/cve', '/#/arsenal']) {
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
    }

    expect(offending, `non-localhost requests during tour: ${offending.join(', ')}`).toEqual([]);
    // sanity: the app actually rendered (not a blank intercepted page)
    await expect(page.getByText('Cephalo').first()).toBeVisible();
  });
});
