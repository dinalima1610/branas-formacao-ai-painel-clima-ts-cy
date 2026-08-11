import { readFileSync } from 'node:fs'

import { type Page } from '@playwright/test'

const citiesCuritiba = readFixture('cities-curitiba.json')
const citiesEmpty = readFixture('cities-empty.json')
const weatherCuritiba = readFixture('weather-curitiba.json')
const weatherError = readFixture('weather-error.json')

interface MockWeatherApiOptions {
  emptyCities?: boolean
  failFirstWeather?: boolean
}

export async function mockWeatherApi(page: Page, options: MockWeatherApiOptions = {}): Promise<() => number> {
  let weatherCalls = 0

  await page.route('**/api/v1/cities/search**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: options.emptyCities === true ? citiesEmpty : citiesCuritiba,
      status: 200,
    })
  })

  await page.route('**/api/v1/weather**', async (route) => {
    weatherCalls += 1

    if (options.failFirstWeather === true && weatherCalls === 1) {
      await route.fulfill({
        contentType: 'application/json',
        json: weatherError,
        status: 502,
      })
      return
    }

    await route.fulfill({
      contentType: 'application/json',
      json: weatherCuritiba,
      status: 200,
    })
  })

  await page.route('**/api.open-meteo.com/**', async (route) => route.abort())
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => route.abort())

  return () => weatherCalls
}

function readFixture(fileName: string): unknown {
  return JSON.parse(readFileSync(new URL(`../fixtures/${fileName}`, import.meta.url), 'utf-8')) as unknown
}
