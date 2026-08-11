import { describe, expect, it } from 'vitest';
import {
  celsiusToFahrenheit,
  convertWeatherPayload,
  fahrenheitToCelsius,
  formatTemperature,
  formatWindSpeed,
  kmhToMph,
  mphToKmh,
} from './units';
import type { WeatherPanelPayload } from '../types';

const payload: WeatherPanelPayload = {
  place: {
    id: 'rio-br',
    name: 'Rio de Janeiro',
    country: 'Brazil',
    latitude: -22.9,
    longitude: -43.17,
    label: 'Rio de Janeiro, Brazil',
  },
  current: {
    apparentTemperature: 11,
    conditionIconKey: 'rain',
    conditionLabel: 'Chuva',
    humidity: 80,
    isDay: true,
    temperature: 10,
    weatherCode: 61,
    windSpeed: 10,
    windSpeedUnit: 'kmh',
  },
  hourly: [
    {
      conditionIconKey: 'rain',
      conditionLabel: 'Chuva',
      temperature: 10,
      time: '2026-05-21T12:00:00.000Z',
      weatherCode: 61,
    },
  ],
  daily: [
    {
      conditionIconKey: 'rain',
      conditionLabel: 'Chuva',
      date: '2026-05-21',
      temperatureMax: 20,
      temperatureMin: 10,
      weatherCode: 61,
    },
  ],
  meta: {
    fetchedAt: '2026-05-21T12:00:00.000Z',
    temperatureUnit: 'celsius',
  },
};

describe('unit conversion helpers', () => {
  it('converts Celsius and Fahrenheit with one-decimal rounding', () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
    expect(fahrenheitToCelsius(100)).toBe(37.8);
  });

  it('converts km/h and mph within rounding tolerance', () => {
    expect(kmhToMph(10)).toBeCloseTo(6.2, 1);
    expect(mphToKmh(6.2)).toBeCloseTo(10, 1);
  });

  it('formats temperature and wind labels for the active unit system', () => {
    const converted = convertWeatherPayload(payload, 'fahrenheit');

    expect(formatTemperature(converted.current.temperature, converted.meta.temperatureUnit)).toBe('50°F');
    expect(converted.current.windSpeedUnit).toBe('mph');
    expect(formatWindSpeed(converted.current.windSpeed, converted.current.windSpeedUnit)).toBe('6.2 mph');
    expect(formatTemperature(converted.daily[0].temperatureMax, converted.meta.temperatureUnit)).toBe('68°F');
  });
});
