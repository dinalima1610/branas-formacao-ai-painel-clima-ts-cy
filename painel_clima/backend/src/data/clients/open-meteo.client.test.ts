import { describe, expect, it, vi } from 'vitest';

import { OpenMeteoClient } from './open-meteo.client';
import { type FetchClient } from '../../types/weather';

describe('OpenMeteoClient', () => {
  it('maps geocoding results into location options', async () => {
    const fetchClient = createFetchClient({
      results: [
        {
          id: 3448439,
          name: 'Sao Paulo',
          admin1: 'Sao Paulo',
          country: 'Brasil',
          country_code: 'BR',
          latitude: -23.55,
          longitude: -46.63,
          timezone: 'America/Sao_Paulo',
          population: 12396372,
        },
      ],
    });
    const client = new OpenMeteoClient({ fetchClient });

    const locations = await client.searchLocations('Sao Paulo', 'pt');

    expect(locations).toEqual([
      {
        id: 'open-meteo:3448439',
        name: 'Sao Paulo',
        admin1: 'Sao Paulo',
        country: 'Brasil',
        countryCode: 'BR',
        latitude: -23.55,
        longitude: -46.63,
        timezone: 'America/Sao_Paulo',
        population: 12396372,
      },
    ]);
  });

  it('returns an empty location list when Open-Meteo has no results', async () => {
    const client = new OpenMeteoClient({ fetchClient: createFetchClient({}) });

    await expect(client.searchLocations('zzzzzz', 'pt')).resolves.toEqual([]);
  });

  it('maps forecast current and daily payloads', async () => {
    const client = new OpenMeteoClient({ fetchClient: createFetchClient(createForecastPayload(7)) });

    const forecast = await client.getForecast({ latitude: -23.55, longitude: -46.63 });

    expect(forecast.timezone).toBe('America/Sao_Paulo');
    expect(forecast.current).toMatchObject({
      measuredAt: '2026-05-13T09:00',
      temperatureCelsius: 22,
      apparentTemperatureCelsius: 23,
      relativeHumidityPercent: 65,
      windSpeedKmh: 12,
      windDirectionDegrees: 180,
      weatherCode: 0,
    });
    expect(forecast.dailyForecast).toHaveLength(7);
    expect(forecast.dailyForecast[0]).toMatchObject({
      date: '2026-05-13',
      minTemperatureCelsius: 14,
      maxTemperatureCelsius: 24,
      precipitationProbabilityPercent: 20,
      maxWindSpeedKmh: 30,
    });
  });

  it('rejects incomplete daily forecasts', async () => {
    const client = new OpenMeteoClient({ fetchClient: createFetchClient(createForecastPayload(6)) });

    await expect(client.getForecast({ latitude: -23.55, longitude: -46.63 })).rejects.toMatchObject({
      code: 'WEATHER_PROVIDER_INCOMPLETE',
    });
  });

  it('translates non-success provider responses into stable errors', async () => {
    const fetchClient: FetchClient = vi.fn(async () => new Response('{}', { status: 503 }));
    const client = new OpenMeteoClient({ fetchClient });

    await expect(client.searchLocations('Sao Paulo', 'pt')).rejects.toMatchObject({
      code: 'WEATHER_PROVIDER_UNAVAILABLE',
    });
  });
});

function createFetchClient(payload: unknown): FetchClient {
  return vi.fn(async () => new Response(JSON.stringify(payload), {
    headers: { 'content-type': 'application/json' },
    status: 200,
  }));
}

function createForecastPayload(dayCount: number): Record<string, unknown> {
  return {
    timezone: 'America/Sao_Paulo',
    current: {
      time: '2026-05-13T09:00',
      temperature_2m: 22,
      apparent_temperature: 23,
      relative_humidity_2m: 65,
      wind_speed_10m: 12,
      wind_direction_10m: 180,
      weather_code: 0,
    },
    current_units: {
      temperature_2m: 'C',
      apparent_temperature: 'C',
      relative_humidity_2m: '%',
      wind_speed_10m: 'km/h',
      wind_direction_10m: 'degrees',
    },
    daily: {
      time: Array.from({ length: dayCount }, (_value, index) => `2026-05-${String(13 + index).padStart(2, '0')}`),
      weather_code: Array.from({ length: dayCount }, () => 0),
      temperature_2m_min: Array.from({ length: dayCount }, (_value, index) => 14 + index),
      temperature_2m_max: Array.from({ length: dayCount }, (_value, index) => 24 + index),
      precipitation_probability_max: Array.from({ length: dayCount }, (_value, index) => 20 + index),
      wind_speed_10m_max: Array.from({ length: dayCount }, (_value, index) => 30 + index),
    },
    daily_units: {
      temperature_2m_max: 'C',
      precipitation_probability_max: '%',
      wind_speed_10m_max: 'km/h',
    },
  };
}
