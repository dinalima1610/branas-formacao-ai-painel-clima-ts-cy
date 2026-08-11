import { expect, type Page, test } from '@playwright/test'

import { mockWeatherApi } from './support/mock-weather-api'

test('renders first access in Portuguese and loads metric weather by city search', async ({ page }) => {
  await mockWeatherApi(page)

  await page.goto('/')

  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(page).toHaveTitle('Painel de clima')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /temperatura/)
  await expect(page.getByRole('heading', { name: 'Clima atual e previsão de 7 dias' })).toBeVisible()

  await searchCity(page, 'Curitiba', 'Selecionar Curitiba, Parana, Brasil')

  await expect(page.getByRole('heading', { name: '24°C' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Próximos 7 dias' })).toBeVisible()
  await expect(page.getByText('12 km/h')).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(7)
  await expect(page.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute('href', 'https://open-meteo.com')
  const hasHorizontalOverflow = await page.evaluate(() => (
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  ))
  expect(hasHorizontalOverflow).toBe(false)
})

test('switches to English without refetching loaded weather', async ({ page }) => {
  const getWeatherCalls = await mockWeatherApi(page)

  await page.goto('/')
  await searchCity(page, 'Curitiba', 'Selecionar Curitiba, Parana, Brasil')
  await page.getByRole('radio', { name: 'Inglês' }).click()

  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
  await expect(page).toHaveTitle('Weather panel')
  await expect(page.getByRole('heading', { name: 'Current weather and 7 day forecast' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '24°C' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Next 7 days' })).toBeVisible()
  expect(getWeatherCalls()).toBe(1)
})

test('persists the selected language across reloads', async ({ page }) => {
  await mockWeatherApi(page)

  await page.goto('/')
  await page.getByRole('radio', { name: 'Inglês' }).click()
  await page.reload()

  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
  await expect(page.getByRole('heading', { name: 'Current weather and 7 day forecast' })).toBeVisible()
})

test('converts loaded weather to imperial units without refetching', async ({ page }) => {
  const getWeatherCalls = await mockWeatherApi(page)

  await page.goto('/')
  await searchCity(page, 'Curitiba', 'Selecionar Curitiba, Parana, Brasil')
  await page.getByRole('radio', { name: '°F / mph' }).click()

  await expect(page.getByRole('heading', { name: '75°F' })).toBeVisible()
  await expect(page.getByText('7 mph')).toBeVisible()
  expect(getWeatherCalls()).toBe(1)
})

test('uses browser geolocation only after explicit user action', async ({ context, page }) => {
  await mockWeatherApi(page)
  await context.grantPermissions(['geolocation'])
  await context.setGeolocation({ latitude: -25.43, longitude: -49.27 })

  await page.goto('/')
  await page.getByRole('button', { name: 'Usar minha localização' }).click()

  await expect(page.getByRole('heading', { name: '24°C' })).toBeVisible()
})

test('shows localized provider error and recovers through retry', async ({ page }) => {
  await mockWeatherApi(page, { failFirstWeather: true })

  await page.goto('/')
  await page.getByRole('radio', { name: 'Inglês' }).click()
  await searchCity(page, 'Curitiba', 'Select Curitiba, Parana, Brasil')

  await expect(page.getByText('Try again in a few moments.')).toBeVisible()
  await page.getByRole('button', { name: 'Try again' }).click()

  await expect(page.getByRole('heading', { name: '24°C' })).toBeVisible()
})

test('supports keyboard navigation through language, units and city results', async ({ page }) => {
  await mockWeatherApi(page)

  await page.goto('/')
  await page.getByRole('radio', { name: 'Inglês' }).focus()
  await page.keyboard.press('Space')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')

  await page.getByRole('radio', { name: '°F / mph' }).focus()
  await page.keyboard.press('Space')
  await expect(page.getByRole('radio', { name: '°F / mph' })).toHaveAttribute('aria-checked', 'true')

  await page.getByRole('combobox', { name: 'Search city' }).fill('Curitiba')
  await expect(page.getByRole('option', { name: 'Select Curitiba, Parana, Brasil' })).toBeVisible()
  await page.keyboard.press('Enter')

  await expect(page.getByRole('heading', { name: '75°F' })).toBeVisible()
})

async function searchCity(page: Page, query: string, optionName: string): Promise<void> {
  await page.getByRole('combobox').fill(query)
  await page.getByRole('option', { name: optionName }).click()
}
