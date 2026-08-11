import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import forecastFixture from '../data/fixtures/forecast-sao-paulo.json';
import {
  ForecastClientInput,
  OpenMeteoForecastResponse
} from '../data/clients/open-meteo-forecast.client';
import { PlaceCandidate } from '../types/weather';
import { ForecastServiceClient, WeatherService } from './weather.service';

const place: PlaceCandidate = {
  id: '3448439',
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  latitude: -23.5475,
  longitude: -46.63611,
  label: 'São Paulo, São Paulo, Brasil'
};

const createForecastResponse = (): OpenMeteoForecastResponse => {
  return {
    current: {
      time: forecastFixture.current.time,
      temperature: forecastFixture.current.temperature_2m,
      apparentTemperature: forecastFixture.current.apparent_temperature,
      humidity: forecastFixture.current.relative_humidity_2m,
      windSpeed: forecastFixture.current.wind_speed_10m,
      weatherCode: forecastFixture.current.weather_code,
      isDay: forecastFixture.current.is_day === 1
    },
    hourly: {
      time: forecastFixture.hourly.time,
      temperature: forecastFixture.hourly.temperature_2m,
      weatherCode: forecastFixture.hourly.weather_code
    },
    daily: {
      date: forecastFixture.daily.time,
      temperatureMin: forecastFixture.daily.temperature_2m_min,
      temperatureMax: forecastFixture.daily.temperature_2m_max,
      weatherCode: forecastFixture.daily.weather_code
    }
  };
};

const createService = (): {
  forecastClient: ForecastServiceClient;
  service: WeatherService;
} => {
  const forecastClient: ForecastServiceClient = {
    getForecast: vi.fn(async (_input: ForecastClientInput) => createForecastResponse())
  };
  const placesService = {
    reverse: vi.fn(async () => [place])
  };

  return {
    forecastClient,
    service: new WeatherService(forecastClient, placesService)
  };
};

describe('WeatherService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-21T15:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('maps forecast JSON to exactly 24 hourly slots and 3-5 daily slots', async () => {
    const { service } = createService();

    const payload = await service.getWeather({
      latitude: -23.55,
      longitude: -46.63,
      temperatureUnit: 'celsius'
    });

    expect(payload.place).toEqual(place);
    expect(payload.current.conditionLabel).toBe('Chuva leve');
    expect(payload.current.conditionIconKey).toBe('rain');
    expect(payload.hourly).toHaveLength(24);
    expect(payload.daily).toHaveLength(5);
    expect(payload.meta).toEqual({
      fetchedAt: '2026-05-21T15:00:00.000Z',
      temperatureUnit: 'celsius'
    });
  });

  it('passes celsius and kmh units to the forecast client', async () => {
    const { forecastClient, service } = createService();

    await service.getWeather({
      latitude: -23.55,
      longitude: -46.63,
      temperatureUnit: 'celsius'
    });

    expect(forecastClient.getForecast).toHaveBeenCalledWith({
      latitude: -23.55,
      longitude: -46.63,
      temperatureUnit: 'celsius',
      windSpeedUnit: 'kmh'
    });
  });

  it('passes fahrenheit and mph units to the forecast client', async () => {
    const { forecastClient, service } = createService();

    await service.getWeather({
      latitude: -23.55,
      longitude: -46.63,
      temperatureUnit: 'fahrenheit'
    });

    expect(forecastClient.getForecast).toHaveBeenCalledWith({
      latitude: -23.55,
      longitude: -46.63,
      temperatureUnit: 'fahrenheit',
      windSpeedUnit: 'mph'
    });
  });
});
