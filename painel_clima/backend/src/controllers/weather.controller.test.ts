import type { Server } from 'node:http';

import { describe, expect, it } from 'vitest';

import { createApp } from '../app';
import {
  type CoordinatesInput,
  type LocationOption,
  type LocationSuggestion,
  type SearchLocationsInput,
  type WeatherPanelData,
  type WeatherQueryInput,
  type WeatherService,
  WeatherError,
} from '../types/weather';

describe('weather HTTP routes', () => {
  it('returns locations from the weather service', async () => {
    const service = new StubWeatherService();

    await withTestServer(service, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v0/locations?query=Sao%20Paulo`);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual({ locations: service.locations });
      expect(service.searchInput).toEqual({ query: 'Sao Paulo', language: undefined });
    });
  });

  it('returns canonical cities through the v1 route', async () => {
    const service = new StubWeatherService();

    await withTestServer(service, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v1/cities/search?q=Sao%20Paulo&limit=1`);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual([
        {
          country: 'Brasil',
          countryCode: 'BR',
          id: 'open-meteo:3448439',
          latitude: -23.55,
          longitude: -46.63,
          name: 'Sao Paulo',
          region: 'Sao Paulo',
          timezone: 'America/Sao_Paulo',
        },
      ]);
      expect(service.searchInput).toEqual({ query: 'Sao Paulo', language: undefined });
    });
  });

  it('returns 422 for invalid location queries', async () => {
    const service = new StubWeatherService();

    await withTestServer(service, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v0/locations?query=a`);
      const payload = await response.json();

      expect(response.status).toBe(422);
      expect(payload).toMatchObject({
        code: 'INVALID_LOCATION_QUERY',
        message: 'Informe uma cidade com pelo menos 2 caracteres.',
      });
    });
  });

  it('returns a reverse geocoding suggestion', async () => {
    const service = new StubWeatherService();

    await withTestServer(service, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v0/locations/reverse?latitude=-23.55&longitude=-46.63`);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual(service.suggestion);
    });
  });

  it('returns weather for coordinates and selected location context', async () => {
    const service = new StubWeatherService();

    await withTestServer(service, async (baseUrl) => {
      const response = await fetch(
        `${baseUrl}/api/v0/weather?latitude=-23.55&longitude=-46.63&locationId=open-meteo:3448439&locationName=Sao%20Paulo&country=Brasil`,
      );
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual(service.weather);
      expect(service.weatherInput).toMatchObject({
        latitude: -23.55,
        longitude: -46.63,
        locationId: 'open-meteo:3448439',
        location: {
          id: 'open-meteo:3448439',
          name: 'Sao Paulo',
          country: 'Brasil',
        },
      });
    });
  });

  it('returns canonical weather through the v1 route', async () => {
    const service = new StubWeatherService();

    await withTestServer(service, async (baseUrl) => {
      const response = await fetch(
        `${baseUrl}/api/v1/weather?lat=-23.55&lon=-46.63&cityId=open-meteo:3448439&cityName=Sao%20Paulo&region=Sao%20Paulo&country=Brasil&countryCode=BR&timezone=America/Sao_Paulo`,
      );
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toMatchObject({
        attribution: {
          provider: 'Open-Meteo',
          url: 'https://open-meteo.com/',
        },
        city: {
          country: 'Brasil',
          countryCode: 'BR',
          id: 'open-meteo:3448439',
          latitude: -23.55,
          longitude: -46.63,
          name: 'Sao Paulo',
          region: 'Sao Paulo',
          timezone: 'America/Sao_Paulo',
        },
        current: {
          description: 'Ceu limpo',
          feelsLikeC: 23,
          humidityPercent: 65,
          icon: 'sun',
          observedAt: '2026-05-13T09:00',
          temperatureC: 22,
          weatherCode: 0,
          windSpeedKmh: 12,
        },
        daily: [],
      });
      expect(service.weatherInput).toMatchObject({
        latitude: -23.55,
        longitude: -46.63,
        locationId: 'open-meteo:3448439',
        location: {
          id: 'open-meteo:3448439',
          name: 'Sao Paulo',
          admin1: 'Sao Paulo',
          country: 'Brasil',
          countryCode: 'BR',
          timezone: 'America/Sao_Paulo',
        },
      });
    });
  });

  it('returns 422 for invalid coordinate query parameters', async () => {
    const service = new StubWeatherService();

    await withTestServer(service, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v0/weather?latitude=bad&longitude=-46.63`);
      const payload = await response.json();

      expect(response.status).toBe(422);
      expect(payload).toMatchObject({
        code: 'INVALID_COORDINATES',
        message: 'Informe latitude e longitude numericas.',
      });
    });
  });

  it('returns 422 for blank coordinate query parameters', async () => {
    const service = new StubWeatherService();

    await withTestServer(service, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v0/weather?latitude=&longitude=`);
      const payload = await response.json();

      expect(response.status).toBe(422);
      expect(payload).toMatchObject({
        code: 'INVALID_COORDINATES',
      });
    });
  });

  it('serves OpenAPI documentation for the public weather endpoints', async () => {
    const service = new StubWeatherService();

    await withTestServer(service, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/v0/openapi.json`);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toMatchObject({
        openapi: '3.0.3',
        paths: {
          '/api/v0/locations': {},
          '/api/v0/locations/reverse': {},
          '/api/v0/weather': {},
          '/api/v1/cities/search': {},
          '/api/v1/weather': {},
        },
      });
    });
  });
});

class StubWeatherService implements WeatherService {
  readonly locations: LocationOption[] = [
    {
      id: 'open-meteo:3448439',
      name: 'Sao Paulo',
      admin1: 'Sao Paulo',
      country: 'Brasil',
      countryCode: 'BR',
      latitude: -23.55,
      longitude: -46.63,
      timezone: 'America/Sao_Paulo',
    },
  ];
  readonly suggestion: LocationSuggestion = {
    confidence: 'fallback',
    source: 'coordinates',
    message: 'Use as coordenadas autorizadas pelo navegador para consultar o clima.',
    location: {
      id: 'coordinates:-23.5500,-46.6300',
      name: 'Localizacao atual',
      latitude: -23.55,
      longitude: -46.63,
    },
  };
  readonly weather: WeatherPanelData = {
    location: this.locations[0] as LocationOption,
    current: {
      measuredAt: '2026-05-13T09:00',
      temperatureCelsius: 22,
      apparentTemperatureCelsius: 23,
      relativeHumidityPercent: 65,
      windSpeedKmh: 12,
      windDirectionDegrees: 180,
      weatherCode: 0,
      condition: 'Ceu limpo',
      units: {
        temperature: 'C',
        apparentTemperature: 'C',
        relativeHumidity: '%',
        windSpeed: 'km/h',
        windDirection: 'degrees',
      },
    },
    dailyForecast: [],
    source: {
      provider: 'open-meteo',
      name: 'Open-Meteo',
      url: 'https://open-meteo.com/',
    },
    generatedAt: '2026-05-13T12:00:00.000Z',
  };
  searchInput?: SearchLocationsInput;
  weatherInput?: WeatherQueryInput;

  async searchLocations(input: SearchLocationsInput): Promise<LocationOption[]> {
    if (input.query.trim().length < 2) {
      throw new WeatherError({
        code: 'INVALID_LOCATION_QUERY',
        message: 'Informe uma cidade com pelo menos 2 caracteres.',
        statusCode: 422,
      });
    }

    this.searchInput = input;
    return this.locations;
  }

  async reverseLocation(_input: CoordinatesInput): Promise<LocationSuggestion> {
    return this.suggestion;
  }

  async getWeather(input: WeatherQueryInput): Promise<WeatherPanelData> {
    this.weatherInput = input;
    return this.weather;
  }
}

async function withTestServer(
  service: WeatherService,
  runAssertions: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const app = createApp({ weatherService: service });
  const server = app.listen(0);
  await waitForServer(server);
  const address = server.address();

  if (address === null || typeof address === 'string') {
    throw new Error('Could not start test server on a TCP port.');
  }

  try {
    await runAssertions(`http://127.0.0.1:${address.port}`);
  } finally {
    await closeServer(server);
  }
}

function waitForServer(server: Server): Promise<void> {
  return new Promise((resolve) => {
    server.once('listening', resolve);
  });
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error !== undefined) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
