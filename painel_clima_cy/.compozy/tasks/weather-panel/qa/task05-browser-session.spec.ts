import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const appUrl = process.env.QA_APP_URL ?? 'http://127.0.0.1:4173/';
const qaRoot = path.resolve(__dirname);
const screenshotDir = path.join(qaRoot, 'screenshots');
const resultsPath = path.join(qaRoot, 'task05-session-results.json');

type Verdict = 'pass' | 'friction' | 'fail' | 'blocked';

interface SessionResult {
  id: string;
  verdict: Verdict;
  notes: string[];
  screenshots: string[];
  browserRequests?: string[];
}

const results: SessionResult[] = [];

function relativeQaPath(filePath: string) {
  return path.relative(qaRoot, filePath).replaceAll(path.sep, '/');
}

async function capture(page, name: string) {
  const filePath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ fullPage: true, path: filePath });
  return relativeQaPath(filePath);
}

async function waitForPanelState(page) {
  await Promise.race([
    page.getByRole('heading', { name: /Escolha o lugar correto/i }).waitFor({ timeout: 15000 }),
    page.getByRole('heading', { name: /Proximas 24 horas|Pr.ximas 24 horas/i }).waitFor({ timeout: 15000 }),
    page.getByRole('alert').waitFor({ timeout: 15000 }),
  ]);
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

async function collectCurrentWeatherText(page) {
  return page.locator('section[aria-labelledby="current-weather-title"]').innerText();
}

test.beforeAll(() => {
  fs.mkdirSync(screenshotDir, { recursive: true });
});

test.afterAll(() => {
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
});

test.describe('Task 05 real-user QA browser sessions', () => {
  test('SMOKE-001 and TC-JOURNEY-001: ambiguous city search reaches forecast', async ({ page }) => {
    const browserRequests: string[] = [];
    page.on('request', (request) => {
      browserRequests.push(request.url());
    });

    const screenshots: string[] = [];
    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    screenshots.push(await capture(page, 'task05-j01-01-entry'));

    await expect(page.getByLabel(/Buscar cidade/i)).toBeVisible();
    await expect(page.getByText(/Busque uma cidade/i)).toBeVisible();

    await page.getByLabel(/Buscar cidade/i).fill('Springfield');
    await page.getByRole('button', { name: /^Buscar$/i }).click();
    await page.getByRole('heading', { name: /Escolha o lugar correto/i }).waitFor({ timeout: 15000 });
    screenshots.push(await capture(page, 'task05-j01-02-disambiguation'));

    await pickCandidate(page, /Illinois|United States|Estados Unidos/i);
    await page.getByRole('heading', { name: /24 horas/i }).waitFor({ timeout: 20000 });
    screenshots.push(await capture(page, 'task05-j01-03-forecast'));

    await expect(page.getByText(/Umidade/i)).toBeVisible();
    await expect(page.getByText(/Vento/i)).toBeVisible();
    await expect(page.getByText(/24 horas/i)).toBeVisible();
    await expect(page.getByText(/dias/i)).toBeVisible();

    const directOpenMeteoRequests = browserRequests.filter((url) => url.includes('open-meteo.com'));
    expect(directOpenMeteoRequests).toEqual([]);

    results.push({
      id: 'SMOKE-001, TC-JOURNEY-001, TC-CFR-006',
      verdict: 'pass',
      notes: [
        'Entry state, Springfield disambiguation, and selected forecast all reached through the public UI.',
        'No browser-side Open-Meteo requests observed; weather/geocoding requests used the project backend boundary.',
      ],
      screenshots,
      browserRequests,
    });
  });

  test('TC-FUNC-001 and TC-PERSONA-001: unit toggle and repeated demo searches remain coherent', async ({ page }) => {
    const screenshots: string[] = [];
    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });

    await searchForWeather(page, 'Sao Paulo', /S.o Paulo|Brazil|Brasil/i);
    screenshots.push(await capture(page, 'task05-j04-01-sao-paulo-celsius'));
    const celsiusText = await collectCurrentWeatherText(page);
    expect(celsiusText).toContain('km/h');

    await page.locator('[aria-label="Unidade de temperatura"] button').nth(1).click();
    await expect(page.locator('section[aria-labelledby="current-weather-title"]')).toContainText('mph');
    screenshots.push(await capture(page, 'task05-j04-02-sao-paulo-fahrenheit'));

    await page.locator('[aria-label="Unidade de temperatura"] button').first().click();
    await expect(page.locator('section[aria-labelledby="current-weather-title"]')).toContainText('km/h');

    await searchForWeather(page, 'Curitiba', /Curitiba|Brazil|Brasil/i);
    screenshots.push(await capture(page, 'task05-j06-01-curitiba-replace'));
    await expect(page.locator('section[aria-labelledby="current-weather-title"]')).toContainText(/Curitiba/i);

    await searchForWeather(page, 'Springfield', /Illinois|United States|Estados Unidos/i);
    screenshots.push(await capture(page, 'task05-j06-02-springfield-third-city'));
    await expect(page.locator('section[aria-labelledby="current-weather-title"]')).toContainText(/Springfield/i);

    results.push({
      id: 'TC-FUNC-001, TC-PERSONA-001',
      verdict: 'pass',
      notes: [
        'Unit toggle changed visible wind labels between km/h and mph with current conditions visible.',
        'Repeated city searches replaced prior city context without requiring refresh.',
      ],
      screenshots,
    });
  });

  test('TC-FUNC-002: no-results search remains recoverable', async ({ page }) => {
    const screenshots: string[] = [];
    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });

    await page.getByLabel(/Buscar cidade/i).fill('zzzznotaplace');
    await page.getByRole('button', { name: /^Buscar$/i }).click();
    await page.getByRole('alert').waitFor({ timeout: 15000 });
    screenshots.push(await capture(page, 'task05-j05-01-no-results'));

    await expect(page.getByRole('alert')).toContainText(/Tente buscar/i);
    await expect(page.getByLabel(/Buscar cidade/i)).toBeEnabled();

    await searchForWeather(page, 'Curitiba', /Curitiba|Brazil|Brasil/i);
    screenshots.push(await capture(page, 'task05-j05-02-no-results-recovery'));

    results.push({
      id: 'TC-FUNC-002',
      verdict: 'pass',
      notes: [
        'No-results guidance was visible in PT-BR and manual search remained enabled.',
        'A valid city search recovered without refreshing the app.',
      ],
      screenshots,
    });
  });

  test('TC-FUNC-003: backend availability failure offers retry and recovers', async ({ page }) => {
    const screenshots: string[] = [];
    let failWeather = true;

    await page.route('**/weather?**', async (route) => {
      if (failWeather) {
        failWeather = false;
        await route.fulfill({
          contentType: 'application/json',
          status: 502,
          body: JSON.stringify({
            code: 'UPSTREAM_WEATHER_ERROR',
            message: 'Synthetic QA upstream failure',
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    await page.getByLabel(/Buscar cidade/i).fill('Sao Paulo');
    await page.getByRole('button', { name: /^Buscar$/i }).click();
    await waitForPanelState(page);

    const candidates = page.getByRole('heading', { name: /Escolha o lugar correto/i });
    if (await candidates.isVisible().catch(() => false)) {
      await pickCandidate(page, /S.o Paulo|Brazil|Brasil/i);
    }

    await page.getByRole('alert').waitFor({ timeout: 20000 });
    screenshots.push(await capture(page, 'task05-j05-03-upstream-failure'));
    await expect(page.getByRole('alert')).toContainText(/temporariamente|Tente novamente/i);

    await page.getByRole('button', { name: /Tentar novamente/i }).click();
    await page.getByRole('heading', { name: /24 horas/i }).waitFor({ timeout: 20000 });
    screenshots.push(await capture(page, 'task05-j05-04-upstream-retry-recovered'));

    results.push({
      id: 'TC-FUNC-003, TC-CFR-005',
      verdict: 'pass',
      notes: [
        'Synthetic 502 on /weather produced PT-BR availability copy and a retry affordance.',
        'Retry recovered the same user journey after availability was restored.',
      ],
      screenshots,
    });
  });

  test('TC-JOURNEY-002: geolocation allow resolves through backend and loads weather', async ({ browser }) => {
    const context = await browser.newContext({
      geolocation: { latitude: -23.5505, longitude: -46.6333 },
      permissions: ['geolocation'],
      viewport: { width: 375, height: 812 },
    });
    const page = await context.newPage();
    const screenshots: string[] = [];

    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    screenshots.push(await capture(page, 'task05-j02-01-mobile-entry'));
    await page.getByRole('button', { name: /Usar minha/i }).click();
    await waitForPanelState(page);

    const candidates = page.getByRole('heading', { name: /Escolha o lugar correto/i });
    if (await candidates.isVisible().catch(() => false)) {
      screenshots.push(await capture(page, 'task05-j02-02-location-candidates'));
      await page.getByRole('button').filter({ hasText: /./ }).last().click();
    }

    await page.getByRole('heading', { name: /24 horas/i }).waitFor({ timeout: 20000 });
    screenshots.push(await capture(page, 'task05-j02-03-location-forecast'));

    const currentText = await collectCurrentWeatherText(page);
    const hasCoordinateFallback = /Local atual\s*\(-?\d|Lat\s-?\d|Lon\s-?\d/i.test(currentText);

    const horizontalOverflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    results.push({
      id: 'TC-JOURNEY-002, TC-CFR-003, TC-CFR-004',
      verdict: hasCoordinateFallback || horizontalOverflow.scrollWidth > horizontalOverflow.clientWidth ? 'friction' : 'pass',
      notes: [
        'Geolocation permission was explicitly granted after clicking the location affordance.',
        hasCoordinateFallback
          ? 'Resolved place label uses coordinate fallback rather than a human-readable locality.'
          : 'Resolved place label was human-readable.',
        horizontalOverflow.scrollWidth > horizontalOverflow.clientWidth
          ? `Mobile 375px viewport completed the weather goal but body width overflowed (${horizontalOverflow.scrollWidth}px scroll width vs ${horizontalOverflow.clientWidth}px client width).`
          : 'Mobile 375px viewport completed the weather goal with no body-level horizontal overflow.',
      ],
      screenshots,
    });
    await context.close();
  });

  test('TC-JOURNEY-003: denied location leaves manual search usable', async ({ browser }) => {
    const context = await browser.newContext({
      permissions: [],
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    const screenshots: string[] = [];

    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Usar minha/i }).click();
    await page.getByRole('alert').waitFor({ timeout: 10000 });
    screenshots.push(await capture(page, 'task05-j03-01-location-denied'));

    await expect(page.getByRole('alert')).toContainText(/buscar uma cidade manualmente/i);
    await expect(page.getByLabel(/Buscar cidade/i)).toBeEnabled();

    await searchForWeather(page, 'Curitiba', /Curitiba|Brazil|Brasil/i);
    screenshots.push(await capture(page, 'task05-j03-02-denial-manual-search'));

    results.push({
      id: 'TC-JOURNEY-003',
      verdict: 'pass',
      notes: [
        'Denied geolocation produced neutral PT-BR guidance.',
        'Manual search remained enabled and reached a city forecast after denial.',
      ],
      screenshots,
    });

    await context.close();
  });

  test('TC-CFR-001, TC-CFR-002, TC-CFR-004: responsive and accessibility quick checks', async ({ page }) => {
    const screenshots: string[] = [];
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
    await searchForWeather(page, 'Sao Paulo', /S.o Paulo|Brazil|Brasil/i);
    screenshots.push(await capture(page, 'task05-cfr-01-tablet-768'));

    await page.setViewportSize({ width: 375, height: 812 });
    screenshots.push(await capture(page, 'task05-cfr-02-mobile-375'));
    const mobileHorizontalOverflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.getByLabel(/Buscar cidade/i).focus();
    screenshots.push(await capture(page, 'task05-cfr-03-keyboard-focus-search'));

    const searchLabel = await page.locator('#weather-search').evaluate((element: HTMLInputElement) =>
      Array.from(element.labels ?? []).map((label) => label.textContent?.trim()).join(' '),
    );
    expect(searchLabel).toContain('Buscar cidade');

    const buttonsWithoutNames = await page.locator('button').evaluateAll((buttons) =>
      buttons
        .map((button, index) => ({ index, name: button.textContent?.trim() || button.getAttribute('aria-label') || '' }))
        .filter((button) => button.name.length === 0),
    );
    expect(buttonsWithoutNames).toEqual([]);

    results.push({
      id: 'TC-CFR-001, TC-CFR-002, TC-CFR-004',
      verdict: mobileHorizontalOverflow.scrollWidth > mobileHorizontalOverflow.clientWidth ? 'friction' : 'pass',
      notes: [
        'Search label is associated with the input and all buttons exposed non-empty text names in this quick check.',
        mobileHorizontalOverflow.scrollWidth > mobileHorizontalOverflow.clientWidth
          ? `Tablet and mobile responsive screenshots captured; body width overflowed at 375px (${mobileHorizontalOverflow.scrollWidth}px scroll width vs ${mobileHorizontalOverflow.clientWidth}px client width).`
          : 'Tablet and mobile responsive screenshots captured; no body-level horizontal overflow at 375px.',
        'Screen-reader audit was limited to DOM/accessibility-name checks because NVDA/VoiceOver tooling is not available in this shell session.',
      ],
      screenshots,
    });
  });
});
