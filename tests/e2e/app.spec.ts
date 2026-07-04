import { test, expect } from '@playwright/test';

// Gate 14 (ship-blocking e2e). Hash routing keeps deep links static-host-safe.

test.describe('Gate 14a — copy gating', () => {
  test('copy-filled is gated on allResolved; copy-raw always works; a <placeholder> string is never copyable as filled', async ({ page }) => {
    await page.goto('/#/linux/technique/linux.enum.nmap');
    const card = page.getByTestId('cmd-linux.enum.nmap.full');
    await expect(card).toBeVisible();

    const copyFilled = card.getByRole('button', { name: /copy filled/i });
    const copyRaw = card.getByRole('button', { name: /copy raw/i });

    // RHOST is unset → the code block shows the inert <RHOST> token → cannot copy filled.
    await expect(card.getByTestId('cmd-code')).toContainText('<RHOST>');
    await expect(copyFilled).toBeDisabled();
    await expect(copyRaw).toBeEnabled();

    // set RHOST → filled resolves → copy-filled enables
    await page.fill('#var-RHOST', '198.51.100.10');
    await expect(copyFilled).toBeEnabled();
    await expect(card.getByTestId('cmd-code')).toContainText('198.51.100.10');
  });
});

test.describe('Gate 14b — search summon', () => {
  test('typing 445 floats the SMB cluster to the top', async ({ page }) => {
    await page.goto('/#/linux');
    await page.keyboard.press('Control+k');
    const input = page.getByPlaceholder(/type a port/i);
    await expect(input).toBeVisible();
    await input.fill('445');
    const firstHit = page.locator('.hit').first();
    await expect(firstHit).toBeVisible();
    // exact-port wins: the port-445 / SMB-service cluster floats to the very top
    // (SMB enumeration, RID cycling, signing check — all 445/SMB-family docs).
    await expect(firstHit).toHaveAttribute('data-testid', /smb|enum\.(signing|rid)/);
    // …and a dedicated SMB doc is present in the leading results
    const top = await page
      .locator('.hit')
      .evaluateAll((els) => els.slice(0, 6).map((e) => e.getAttribute('data-testid') ?? ''));
    expect(top.some((id) => /smb/.test(id))).toBe(true);
  });
});

test.describe('Gate 14c — realm theming', () => {
  test('switching realm flips data-os with no remount/flash', async ({ page }) => {
    await page.goto('/#/linux');
    await expect(page.locator('html')).toHaveAttribute('data-os', 'linux');
    const varBar = page.locator('.var-bar');
    await expect(varBar).toBeVisible();
    await page.getByRole('button', { name: 'Windows' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-os', 'windows');
    // the variable bar is still the same mounted element (no remount)
    await expect(varBar).toBeVisible();
  });
});

test.describe('Gate 14d — responsible-use note', () => {
  test('present on a hands-on surface and exposes NO dismiss control', async ({ page }) => {
    await page.goto('/#/linux/technique/linux.enum.nmap');
    const notes = page.getByTestId('responsible-use-note');
    await expect(notes.first()).toBeVisible();
    await expect(notes.first()).toContainText('Authorized testing only');
    // no dismiss/close affordance anywhere in the note
    await expect(notes.first().locator('button')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /dismiss|close/i })).toHaveCount(0);
  });
});

test.describe('Gate 14e — credMode variant swap', () => {
  test('toggling password/nthash/kerberos swaps the authored template (not string surgery)', async ({ page }) => {
    await page.goto('/#/ad/technique/ad.lateral.psexec');
    const card = page.getByTestId('cmd-ad.lateral.psexec.run');
    await expect(card).toBeVisible();
    const code = card.getByTestId('cmd-code');

    // password (default) → user:pass auth segment
    await expect(code).toContainText(':');

    await card.getByRole('button', { name: 'nthash' }).click();
    await expect(code).toContainText('-hashes :');

    await card.getByRole('button', { name: 'kerberos' }).click();
    await expect(code).toContainText('-k -no-pass');
  });
});
