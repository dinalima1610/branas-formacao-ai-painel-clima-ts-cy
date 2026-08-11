import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWeather, reversePlace, searchPlaces } from '../api/weather-api';
import type { PlaceCandidate, WeatherPanelPayload } from '../types';
import { useWeatherPanel } from './useWeatherPanel';

vi.mock('../api/weather-api', () => ({
  fetchWeather: vi.fn(),
  reversePlace: vi.fn(),
  searchPlaces: vi.fn(),
}));

const place: PlaceCandidate = {
  id: 'lisbon-pt',
  name: 'Lisboa',
  country: 'Portugal',
  latitude: 38.72,
  longitude: -9.14,
  label: 'Lisboa, Portugal',
};

const weather: WeatherPanelPayload = {
  place,
  current: {
    apparentTemperature: 11,
    conditionIconKey: 'cloudy',
    conditionLabel: 'Nublado',
    humidity: 70,
    isDay: true,
    temperature: 10,
    weatherCode: 3,
    windSpeed: 10,
    windSpeedUnit: 'kmh',
  },
  daily: [
    {
      conditionIconKey: 'cloudy',
      conditionLabel: 'Nublado',
      date: '2026-05-21',
      temperatureMax: 20,
      temperatureMin: 10,
      weatherCode: 3,
    },
  ],
  hourly: [
    {
      conditionIconKey: 'cloudy',
      conditionLabel: 'Nublado',
      temperature: 10,
      time: '2026-05-21T12:00:00.000Z',
      weatherCode: 3,
    },
  ],
  meta: {
    fetchedAt: '2026-05-21T12:00:00.000Z',
    temperatureUnit: 'celsius',
  },
};

describe('useWeatherPanel', () => {
  beforeEach(() => {
    vi.mocked(fetchWeather).mockReset();
    vi.mocked(reversePlace).mockReset();
    vi.mocked(searchPlaces).mockReset();
  });

  it('updates all visible units without invoking fetchWeather again', async () => {
    vi.mocked(searchPlaces).mockResolvedValue([place]);
    vi.mocked(fetchWeather).mockResolvedValue(weather);

    const { result } = renderHook(() => useWeatherPanel());

    act(() => {
      result.current.setQuery('Lisboa');
    });
    await act(async () => {
      await result.current.submitSearch();
    });

    expect(result.current.weather?.current.temperature).toBe(10);
    expect(result.current.weather?.current.windSpeedUnit).toBe('kmh');
    expect(fetchWeather).toHaveBeenCalledWith(place.latitude, place.longitude, 'celsius');
    expect(fetchWeather).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.toggleTemperatureUnit('fahrenheit');
    });

    expect(result.current.weather?.current.temperature).toBe(50);
    expect(result.current.weather?.hourly[0].temperature).toBe(50);
    expect(result.current.weather?.daily[0].temperatureMax).toBe(68);
    expect(result.current.weather?.current.windSpeed).toBe(6.2);
    expect(result.current.weather?.current.windSpeedUnit).toBe('mph');
    expect(fetchWeather).toHaveBeenCalledTimes(1);
  });
});
