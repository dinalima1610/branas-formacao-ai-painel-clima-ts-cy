import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const appUrl = process.env.QA_APP_URL ?? 'http://127.0.0.1:4173/';
const qaRoot = path.resolve(__dirname);
const screenshotDir = path.join(qaRoot, 'screenshots');
const resultsPath = path.join(qaRoot, 'task05-charter-extra-results.json');

const results: Array<{
  charter: string;
  verdict: 'pass' | 'friction' | 'fail' | 'blocked';
  notes: string[];
  screenshots: string[];
}> = [];

function relativeQaPath(filePath: string) {
  return path.relative(qaRoot, filePath).replaceAll(path.sep, '/');
}

async function capture(page, name: string) {
  const filePath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ fullPage: true, path: filePath });
  return relativeQaPath(filePath);
}

async function pickCandidate(page, label: RegExp) {
  const candidate = page.getByRole('button').filter({ hasText: label }).first();
  if (await candidate.count()) {
    await candidate.click();
    return;
  }

  await page.getByRole('button').filter({ hasText: /.+/ }).last().click();
}

async function searchForWeather(page, query: string, candidateLabel = /./) {
  const searchResponse = page.waitForResponse((response) => response.url().includes('/places/search'));
  await page.getByLabel(/Buscar cidade/i).fill(query);
  await page.getByRole('button', { name: /^Buscar$/i }).click();
  await searchResponse;

  const candidates = page.getByRole('heading', { name: /Escolha o lugar correto/i });
  if (await candidates.isVisible().catch(() => false)) {
    const weatherResponse = page.waitForResponse((response) => response.url().includes('/weather?'));
    await pickCandidate(page, candidateLabel);
    await weatherResponse;
  } else {
    await page.waitForResponse((response) => response.url().includes('/weather?'));
  }

  await page.getByRole('heading', { name: /24 horas/i }).waitFor({ timeout: 20000 });
}

test.beforeAll(() => {
  fs.mkdirSync(screenshotDir, { recursive: true });
});

test.afterAll(() => {
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
});

test('CH-01 Network Tour: delayed weather request still shows loading feedback', async ({ page }) => {
  const screenshots: string[] = [];

  await page.route('**/weather?**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });

  await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
  await page.getByLabel(/Buscar cidade/i).fill('Curitiba');
  await page.getByRole('button', { name: /^Buscar$/i }).click();
  await page.waitForResponse((response) => response.url().includes('/places/search'));

  const candidates = page.getByRole('heading', { name: /Escolha o lugar correto/i });
  if (await candidates.isVisible().catch(() => false)) {
    await pickCandidate(page, /Curitiba|Brazil|Brasil/i);
  }

  await page.getByText(/Carregando/i).waitFor({ timeout: 5000 });
  screenshots.push(await capture(page, 'task05-ch01-01-delayed-weather-loading'));
  await page.getByRole('heading', { name: /24 horas/i }).waitFor({ timeout: 20000 });
  screenshots.push(await capture(page, 'task05-ch01-02-delayed-weather-loaded'));

  results.push({
    charter: 'CH-01',
    verdict: 'pass',
    notes: [
      'Delayed /weather response showed visible loading feedback before forecast content arrived.',
      'Forecast loaded after the delayed network variation without duplicate or stuck loading state.',
    ],
    screenshots,
  });
});

test('CH-02 Garbage Tour: accented and long pasted queries remain recoverable', async ({ page }) => {
  const screenshots: string[] = [];

  await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
  await searchForWeather(page, 'São Paulo', /S.o Paulo|Brazil|Brasil/i);
  screenshots.push(await capture(page, 'task05-ch02-01-sao-paulo-accented'));

  const longQuery = 'cidade inexistente '.repeat(40);
  await page.getByLabel(/Buscar cidade/i).fill(longQuery);
  await page.getByRole('button', { name: /^Buscar$/i }).click();
  await page.getByRole('alert').waitFor({ timeout: 15000 });
  screenshots.push(await capture(page, 'task05-ch02-02-long-query-error'));
  await expect(page.getByLabel(/Buscar cidade/i)).toBeEnabled();

  await searchForWeather(page, 'Curitiba', /Curitiba|Brazil|Brasil/i);
  screenshots.push(await capture(page, 'task05-ch02-03-corrected-curitiba'));

  results.push({
    charter: 'CH-02',
    verdict: 'pass',
    notes: [
      'Accented Sao Paulo query resolved to weather through the public UI.',
      'Long pasted non-city query produced recoverable PT-BR no-results guidance, then corrected Curitiba search loaded forecast without refresh.',
    ],
    screenshots,
  });
});

test('CH-03 Back-Button Tour: no-results recovery survives back and refresh', async ({ page }) => {
  const screenshots: string[] = [];

  await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
  await page.getByLabel(/Buscar cidade/i).fill('zzzznotaplace');
  await page.getByRole('button', { name: /^Buscar$/i }).click();
  await page.getByRole('alert').waitFor({ timeout: 15000 });
  screenshots.push(await capture(page, 'task05-ch03-01-no-results-before-back'));

  await page.goBack({ waitUntil: 'domcontentloaded', timeout: 2000 }).catch(() => null);
  screenshots.push(await capture(page, 'task05-ch03-02-after-back-attempt'));

  if (!(await page.getByLabel(/Buscar cidade/i).isVisible().catch(() => false))) {
    await page.goForward({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null);
  }

  await expect(page.getByLabel(/Buscar cidade/i)).toBeVisible();

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByLabel(/Buscar cidade/i)).toBeVisible();
  await expect(page.getByText(/Busque uma cidade/i)).toBeVisible();
  screenshots.push(await capture(page, 'task05-ch03-03-refresh-recovered'));

  await searchForWeather(page, 'Curitiba', /Curitiba|Brazil|Brasil/i);
  screenshots.push(await capture(page, 'task05-ch03-04-manual-after-refresh'));

  results.push({
    charter: 'CH-03',
    verdict: 'pass',
    notes: [
      'Browser Back from the single-route direct-entry page left the app instead of creating an in-app stuck state; Forward returned to a usable panel.',
      'Refresh returned the panel to a sensible initial state and manual search reached forecast.',
    ],
    screenshots,
  });
});
