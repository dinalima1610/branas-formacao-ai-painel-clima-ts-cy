import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DefaultWeatherService } from './weather.service';
import {
  type CoordinatesInput,
  type LocationOption,
  type LocationSuggestion,
  type ProviderForecast,
  type ReverseGeocodingClient,
  type SearchLocationsInput,
  type WeatherProviderClient,
  type WeatherQueryInput,
} from '../types/weather';

describe('DefaultWeatherService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-13T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('searches locations with normalized query and default language', async () => {
    const providerClient = new StubWeatherProviderClient();
    const service = createService(providerClient);

    const locations = await service.searchLocations({ query: '  Curitiba  ' });

    expect(locations).toEqual(providerClient.locations);
    expect(providerClient.searchInput).toEqual({ query: 'Curitiba', language: 'pt' });
  });

  it('returns current weather and a seven day forecast with condition descriptions', async () => {
    const providerClient = new StubWeatherProviderClient();
    const service = createService(providerClient);

    const weather = await service.getWeather({
      latitude: -23.55,
      longitude: -46.63,
      locationId: 'open-meteo:3448439',
      location: {
        name: 'Sao Paulo',
        admin1: 'Sao Paulo',
        country: 'Brasil',
        countryCode: 'BR',
      },
    });

    expect(weather.location).toMatchObject({
      id: 'open-meteo:3448439',
      name: 'Sao Paulo',
      admin1: 'Sao Paulo',
      country: 'Brasil',
      countryCode: 'BR',
      timezone: 'America/Sao_Paulo',
    });
    expect(weather.current.condition).toBe('Ceu limpo');
    expect(weather.dailyForecast).toHaveLength(7);
    expect(weather.dailyForecast[1]?.condition).toBe('Chuva moderada');
    expect(weather.source.provider).toBe('open-meteo');
    expect(weather.generatedAt).toBe('2026-05-13T12:00:00.000Z');
  });

  it('falls back to coordinates when reverse geocoding has no city', async () => {
    const reverseClient = new StubReverseGeocodingClient();
    reverseClient.suggestion = null;
    const service = createService(new StubWeatherProviderClient(), reverseClient);

    const suggestion = await service.reverseLocation({ latitude: -23.55, longitude: -46.63 });

    expect(suggestion).toMatchObject({
      confidence: 'fallback',
      source: 'coordinates',
      location: {
        id: 'coordinates:-23.5500,-46.6300',
        name: 'Localizacao atual',
      },
    });
  });

  it('falls back to coordinates when reverse geocoding fails', async () => {
    const reverseClient = new StubReverseGeocodingClient();
    reverseClient.error = new Error('provider failed');
    const service = createService(new StubWeatherProviderClient(), reverseClient);

    const suggestion = await service.reverseLocation({ latitude: -23.55, longitude: -46.63 });

    expect(suggestion.source).toBe('coordinates');
  });

  it('rejects incomplete forecasts', async () => {
    const providerClient = new StubWeatherProviderClient();
    providerClient.forecast = createProviderForecast(6);
    const service = createService(providerClient);

    await expect(service.getWeather({ latitude: -23.55, longitude: -46.63 })).rejects.toMatchObject({
      code: 'WEATHER_PROVIDER_INCOMPLETE',
    });
  });
});

function createService(
  providerClient: StubWeatherProviderClient,
  reverseClient = new StubReverseGeocodingClient(),
): DefaultWeatherService {
  return new DefaultWeatherService({
    weatherProviderClient: providerClient,
    reverseGeocodingClient: reverseClient,
  });
}

class StubWeatherProviderClient implements WeatherProviderClient {
  forecast: ProviderForecast = createProviderForecast(7);
  readonly locations: LocationOption[] = [
    {
      id: 'open-meteo:6322752',
      name: 'Curitiba',
      admin1: 'Parana',
      country: 'Brasil',
      countryCode: 'BR',
      latitude: -25.43,
      longitude: -49.27,
      timezone: 'America/Sao_Paulo',
      population: 1963726,
    },
  ];
  searchInput?: { query: string; language: string };

  async searchLocations(query: string, language: string): Promise<LocationOption[]> {
    this.searchInput = { query, language };
    return this.locations;
  }

  async getForecast(_input: CoordinatesInput): Promise<ProviderForecast> {
    return this.forecast;
  }
}

class StubReverseGeocodingClient implements ReverseGeocodingClient {
  error?: Error;
  suggestion: LocationSuggestion | null = {
    confidence: 'high',
    source: 'google-geocoding',
    message: 'Cidade sugerida com base na localizacao autorizada pelo navegador.',
    location: {
      id: 'coordinates:-23.5500,-46.6300',
      name: 'Sao Paulo',
      admin1: 'Sao Paulo',
      country: 'Brasil',
      countryCode: 'BR',
      latitude: -23.55,
      longitude: -46.63,
    },
  };

  async findNearestCity(_input: CoordinatesInput): Promise<LocationSuggestion | null> {
    if (this.error !== undefined) {
      throw this.error;
    }

    return this.suggestion;
  }
}

function createProviderForecast(dayCount: number): ProviderForecast {
  return {
    timezone: 'America/Sao_Paulo',
    current: {
      measuredAt: '2026-05-13T09:00',
      temperatureCelsius: 22,
      apparentTemperatureCelsius: 23,
      relativeHumidityPercent: 65,
      windSpeedKmh: 12,
      windDirectionDegrees: 180,
      weatherCode: 0,
      units: {
        temperature: 'C',
        apparentTemperature: 'C',
        relativeHumidity: '%',
        windSpeed: 'km/h',
        windDirection: 'degrees',
      },
    },
    dailyForecast: Array.from({ length: dayCount }, (_value, index) => ({
      date: `2026-05-${String(13 + index).padStart(2, '0')}`,
      weatherCode: index === 1 ? 63 : 0,
      minTemperatureCelsius: 14 + index,
      maxTemperatureCelsius: 24 + index,
      precipitationProbabilityPercent: 20 + index,
      maxWindSpeedKmh: 30 + index,
      units: {
        temperature: 'C',
        precipitationProbability: '%',
        windSpeed: 'km/h',
      },
    })),
  };
}
