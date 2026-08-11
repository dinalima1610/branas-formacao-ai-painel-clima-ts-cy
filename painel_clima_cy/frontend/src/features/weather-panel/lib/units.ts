import type { CurrentConditions, DailyForecastSlot, HourlyForecastSlot, TemperatureUnit, WeatherPanelPayload, WindSpeedUnit } from '../types';

const kmhToMphRatio = 0.621371;

export function roundValue(value: number, fractionDigits = 1) {
  return Number(value.toFixed(fractionDigits));
}

export function celsiusToFahrenheit(value: number) {
  return roundValue((value * 9) / 5 + 32);
}

export function fahrenheitToCelsius(value: number) {
  return roundValue(((value - 32) * 5) / 9);
}

export function kmhToMph(value: number) {
  return roundValue(value * kmhToMphRatio);
}

export function mphToKmh(value: number) {
  return roundValue(value / kmhToMphRatio);
}

export function getWindSpeedUnit(temperatureUnit: TemperatureUnit): WindSpeedUnit {
  return temperatureUnit === 'celsius' ? 'kmh' : 'mph';
}

export function convertTemperatureFromCelsius(value: number, temperatureUnit: TemperatureUnit) {
  return temperatureUnit === 'celsius' ? roundValue(value) : celsiusToFahrenheit(value);
}

export function convertWindFromKmh(value: number, temperatureUnit: TemperatureUnit) {
  return temperatureUnit === 'celsius' ? roundValue(value) : kmhToMph(value);
}

export function formatTemperature(value: number, temperatureUnit: TemperatureUnit) {
  const unitLabel = temperatureUnit === 'celsius' ? 'C' : 'F';

  return `${Math.round(value)}°${unitLabel}`;
}

export function formatWindSpeed(value: number, windSpeedUnit: WindSpeedUnit) {
  return `${roundValue(value)} ${windSpeedUnit === 'kmh' ? 'km/h' : 'mph'}`;
}

function normalizeTemperature(value: number, sourceUnit: TemperatureUnit) {
  return sourceUnit === 'celsius' ? roundValue(value) : fahrenheitToCelsius(value);
}

function normalizeWind(value: number, sourceUnit: WindSpeedUnit) {
  return sourceUnit === 'kmh' ? roundValue(value) : mphToKmh(value);
}

export function normalizeWeatherPayloadToCelsius(payload: WeatherPanelPayload): WeatherPanelPayload {
  const sourceUnit = payload.meta.temperatureUnit;

  return {
    ...payload,
    current: {
      ...payload.current,
      temperature: normalizeTemperature(payload.current.temperature, sourceUnit),
      apparentTemperature: normalizeTemperature(payload.current.apparentTemperature, sourceUnit),
      windSpeed: normalizeWind(payload.current.windSpeed, payload.current.windSpeedUnit),
      windSpeedUnit: 'kmh',
    },
    hourly: payload.hourly.map((slot) => ({
      ...slot,
      temperature: normalizeTemperature(slot.temperature, sourceUnit),
    })),
    daily: payload.daily.map((slot) => ({
      ...slot,
      temperatureMin: normalizeTemperature(slot.temperatureMin, sourceUnit),
      temperatureMax: normalizeTemperature(slot.temperatureMax, sourceUnit),
    })),
    meta: {
      ...payload.meta,
      temperatureUnit: 'celsius',
    },
  };
}

export function convertCurrentConditions(current: CurrentConditions, temperatureUnit: TemperatureUnit): CurrentConditions {
  return {
    ...current,
    temperature: convertTemperatureFromCelsius(current.temperature, temperatureUnit),
    apparentTemperature: convertTemperatureFromCelsius(current.apparentTemperature, temperatureUnit),
    windSpeed: convertWindFromKmh(current.windSpeed, temperatureUnit),
    windSpeedUnit: getWindSpeedUnit(temperatureUnit),
  };
}

export function convertHourlySlot(slot: HourlyForecastSlot, temperatureUnit: TemperatureUnit): HourlyForecastSlot {
  return {
    ...slot,
    temperature: convertTemperatureFromCelsius(slot.temperature, temperatureUnit),
  };
}

export function convertDailySlot(slot: DailyForecastSlot, temperatureUnit: TemperatureUnit): DailyForecastSlot {
  return {
    ...slot,
    temperatureMin: convertTemperatureFromCelsius(slot.temperatureMin, temperatureUnit),
    temperatureMax: convertTemperatureFromCelsius(slot.temperatureMax, temperatureUnit),
  };
}

export function convertWeatherPayload(payload: WeatherPanelPayload, temperatureUnit: TemperatureUnit): WeatherPanelPayload {
  return {
    ...payload,
    current: convertCurrentConditions(payload.current, temperatureUnit),
    hourly: payload.hourly.map((slot) => convertHourlySlot(slot, temperatureUnit)),
    daily: payload.daily.map((slot) => convertDailySlot(slot, temperatureUnit)),
    meta: {
      ...payload.meta,
      temperatureUnit,
    },
  };
}
