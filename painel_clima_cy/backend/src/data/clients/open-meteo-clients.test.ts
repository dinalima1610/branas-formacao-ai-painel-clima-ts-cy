import { describe, expect, it, vi } from 'vitest';

import forecastFixture from '../fixtures/forecast-sao-paulo.json';
import geocodingFixture from '../fixtures/geocoding-search-sao-paulo.json';
import { OpenMeteoForecastClient } from './open-meteo-forecast.client';
import { OpenMeteoGeocodingClient } from './open-meteo-geocoding.client';

const jsonResponse = (body: unknown): Response => {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
};

describe('OpenMeteoGeocodingClient', () => {
  it('builds the search query string for Open-Meteo', async () => {
    const fetchClient = vi.fn(async () => jsonResponse(geocodingFixture));
    const client = new OpenMeteoGeocodingClient({ fetchClient });

    await client.search({ query: 'São Paulo', count: 5 });

    const url = new URL(String(fetchClient.mock.calls[0][0]));
    expect(url.href).toContain('https://geocoding-api.open-meteo.com/v1/search');
    expect(url.searchParams.get('name')).toBe('São Paulo');
    expect(url.searchParams.get('count')).toBe('5');
    expect(url.searchParams.get('language')).toBe('pt');
    expect(url.searchParams.get('format')).toBe('json');
  });

  it('builds the reverse query string for Open-Meteo', async () => {
    const fetchClient = vi.fn(async () => jsonResponse(geocodingFixture));
    const client = new OpenMeteoGeocodingClient({ fetchClient });

    await client.reverse({ latitude: -23.55, longitude: -46.63, count: 5 });

    const url = new URL(String(fetchClient.mock.calls[0][0]));
    expect(url.href).toContain('https://geocoding-api.open-meteo.com/v1/reverse');
    expect(url.searchParams.get('latitude')).toBe('-23.55');
    expect(url.searchParams.get('longitude')).toBe('-46.63');
    expect(url.searchParams.get('count')).toBe('5');
  });
});

describe('OpenMeteoForecastClient', () => {
  it('builds the forecast query string with current, hourly, daily, and unit variables', async () => {
    const fetchClient = vi.fn(async () => jsonResponse(forecastFixture));
    const client = new OpenMeteoForecastClient({ fetchClient });

    await client.getForecast({
      latitude: -23.55,
      longitude: -46.63,
      temperatureUnit: 'celsius',
      windSpeedUnit: 'kmh'
    });

    const url = new URL(String(fetchClient.mock.calls[0][0]));
    expect(url.href).toContain('https://api.open-meteo.com/v1/forecast');
    expect(url.searchParams.get('current')).toContain('temperature_2m');
    expect(url.searchParams.get('current')).toContain('wind_speed_10m');
    expect(url.searchParams.get('hourly')).toBe('temperature_2m,weather_code');
    expect(url.searchParams.get('daily')).toBe('weather_code,temperature_2m_max,temperature_2m_min');
    expect(url.searchParams.get('forecast_days')).toBe('5');
    expect(url.searchParams.get('temperature_unit')).toBe('celsius');
    expect(url.searchParams.get('wind_speed_unit')).toBe('kmh');
    expect(url.searchParams.get('timezone')).toBe('auto');
  });
});
