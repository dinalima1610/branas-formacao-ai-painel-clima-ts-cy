import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const appUrl = process.env.QA_APP_URL ?? 'http://127.0.0.1:4173/';
const qaRoot = path.resolve(__dirname);
const screenshotDir = path.join(qaRoot, 'screenshots');

async function pickCandidate(page, label: RegExp) {
  const candidate = page.getByRole('button').filter({ hasText: label }).first();
  if (await candidate.count()) {
    await candidate.click();
    return;
  }

  await page.getByRole('button').filter({ hasText: /.+/ }).last().click();
}

test.beforeAll(() => {
  fs.mkdirSync(screenshotDir, { recursive: true });
});

test('compatibility smoke: valid city reaches weather forecast', async ({ browserName, page }) => {
  await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
  await page.getByLabel(/Buscar cidade/i).fill('Sao Paulo');
  await page.getByRole('button', { name: /^Buscar$/i }).click();
  await page.waitForResponse((response) => response.url().includes('/places/search'));

  const candidates = page.getByRole('heading', { name: /Escolha o lugar correto/i });
  if (await candidates.isVisible().catch(() => false)) {
    await pickCandidate(page, /S.o Paulo|Brazil|Brasil/i);
    await page.waitForResponse((response) => response.url().includes('/weather?'));
  } else {
    await page.waitForResponse((response) => response.url().includes('/weather?'));
  }

  await page.getByRole('heading', { name: /24 horas/i }).waitFor({ timeout: 20000 });
  await expect(page.locator('section[aria-labelledby="current-weather-title"]')).toContainText(/S.o Paulo/i);
  await page.screenshot({
    fullPage: true,
    path: path.join(screenshotDir, `task05-compat-${browserName}-sao-paulo.png`),
  });
});
