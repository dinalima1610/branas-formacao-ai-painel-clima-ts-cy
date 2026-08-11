import {
  FORECAST_DAYS,
  WeatherError,
  type CoordinatesInput,
  type FetchClient,
  type LocationOption,
  type ProviderCurrentWeather,
  type ProviderDailyForecast,
  type ProviderForecast,
} from '../../types/weather';

const DEFAULT_TIMEOUT_MS = 5_000;
const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const CURRENT_VARIABLES = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'wind_speed_10m',
  'wind_direction_10m',
  'weather_code',
].join(',');
const DAILY_VARIABLES = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'wind_speed_10m_max',
].join(',');

interface OpenMeteoClientOptions {
  fetchClient?: FetchClient;
  timeoutMs?: number;
}

type JsonRecord = Record<string, unknown>;

export class OpenMeteoClient {
  private readonly fetchClient: FetchClient;
  private readonly timeoutMs: number;

  constructor(options: OpenMeteoClientOptions = {}) {
    this.fetchClient = options.fetchClient ?? fetch;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async searchLocations(query: string, language: string): Promise<LocationOption[]> {
    const url = new URL(GEOCODING_BASE_URL);
    url.searchParams.set('name', query);
    url.searchParams.set('count', '10');
    url.searchParams.set('language', language.toLowerCase());
    url.searchParams.set('format', 'json');

    const payload = await this.fetchJson(url);
    const results = payload.results;

    if (results === undefined) {
      return [];
    }

    if (!Array.isArray(results)) {
      throw this.createIncompleteError();
    }

    return results
      .filter(isRecord)
      .map((result) => this.mapLocation(result))
      .filter((location): location is LocationOption => location !== null);
  }

  async getForecast(input: CoordinatesInput): Promise<ProviderForecast> {
    const url = new URL(FORECAST_BASE_URL);
    url.searchParams.set('latitude', String(input.latitude));
    url.searchParams.set('longitude', String(input.longitude));
    url.searchParams.set('current', CURRENT_VARIABLES);
    url.searchParams.set('daily', DAILY_VARIABLES);
    url.searchParams.set('forecast_days', String(FORECAST_DAYS));
    url.searchParams.set('timezone', 'auto');

    const payload = await this.fetchJson(url);
    const current = getRequiredRecord(payload, 'current');
    const currentUnits = getOptionalRecord(payload, 'current_units');
    const daily = getRequiredRecord(payload, 'daily');
    const dailyUnits = getOptionalRecord(payload, 'daily_units');

    return {
      timezone: getOptionalString(payload, 'timezone'),
      current: this.mapCurrentWeather(current, currentUnits),
      dailyForecast: this.mapDailyForecast(daily, dailyUnits),
    };
  }

  private async fetchJson(url: URL): Promise<JsonRecord> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchClient(url, { signal: controller.signal });

      if (!response.ok) {
        throw new WeatherError({
          code: 'WEATHER_PROVIDER_UNAVAILABLE',
          message: 'Nao foi possivel consultar o fornecedor de clima.',
          statusCode: 502,
        });
      }

      const payload: unknown = await response.json();

      if (!isRecord(payload)) {
        throw this.createIncompleteError();
      }

      if (payload.error === true) {
        throw new WeatherError({
          code: 'WEATHER_PROVIDER_UNAVAILABLE',
          message: 'O fornecedor de clima rejeitou a consulta.',
          statusCode: 502,
        });
      }

      return payload;
    } catch (error) {
      if (error instanceof WeatherError) {
        throw error;
      }

      throw new WeatherError({
        code: 'WEATHER_PROVIDER_UNAVAILABLE',
        message: 'Nao foi possivel consultar o fornecedor de clima.',
        statusCode: 502,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  private mapLocation(result: JsonRecord): LocationOption | null {
    const name = getOptionalString(result, 'name');
    const latitude = getOptionalNumber(result, 'latitude');
    const longitude = getOptionalNumber(result, 'longitude');

    if (name === undefined || latitude === undefined || longitude === undefined) {
      return null;
    }

    return {
      id: this.createLocationId(result, latitude, longitude),
      name,
      admin1: getOptionalString(result, 'admin1'),
      country: getOptionalString(result, 'country'),
      countryCode: getOptionalString(result, 'country_code'),
      latitude,
      longitude,
      timezone: getOptionalString(result, 'timezone'),
      population: getOptionalNumber(result, 'population'),
    };
  }

  private createLocationId(result: JsonRecord, latitude: number, longitude: number): string {
    const providerId = getOptionalNumber(result, 'id');

    if (providerId !== undefined) {
      return `open-meteo:${providerId}`;
    }

    return `open-meteo:${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  }

  private mapCurrentWeather(current: JsonRecord, units: JsonRecord | undefined): ProviderCurrentWeather {
    return {
      measuredAt: getRequiredString(current, 'time'),
      temperatureCelsius: getRequiredNumber(current, 'temperature_2m'),
      apparentTemperatureCelsius: getRequiredNumber(current, 'apparent_temperature'),
      relativeHumidityPercent: getRequiredNumber(current, 'relative_humidity_2m'),
      windSpeedKmh: getRequiredNumber(current, 'wind_speed_10m'),
      windDirectionDegrees: getRequiredNumber(current, 'wind_direction_10m'),
      weatherCode: getRequiredNumber(current, 'weather_code'),
      units: {
        temperature: getUnit(units, 'temperature_2m', 'C'),
        apparentTemperature: getUnit(units, 'apparent_temperature', 'C'),
        relativeHumidity: getUnit(units, 'relative_humidity_2m', '%'),
        windSpeed: getUnit(units, 'wind_speed_10m', 'km/h'),
        windDirection: getUnit(units, 'wind_direction_10m', 'degrees'),
      },
    };
  }

  private mapDailyForecast(daily: JsonRecord, units: JsonRecord | undefined): ProviderDailyForecast[] {
    const dates = getRequiredArray(daily, 'time');

    if (dates.length < FORECAST_DAYS) {
      throw this.createIncompleteError();
    }

    return dates.slice(0, FORECAST_DAYS).map((dateValue, index) => {
      if (typeof dateValue !== 'string') {
        throw this.createIncompleteError();
      }

      return {
        date: dateValue,
        weatherCode: getRequiredNumberAt(daily, 'weather_code', index),
        minTemperatureCelsius: getRequiredNumberAt(daily, 'temperature_2m_min', index),
        maxTemperatureCelsius: getRequiredNumberAt(daily, 'temperature_2m_max', index),
        precipitationProbabilityPercent: getOptionalNumberAt(daily, 'precipitation_probability_max', index),
        maxWindSpeedKmh: getOptionalNumberAt(daily, 'wind_speed_10m_max', index),
        units: {
          temperature: getUnit(units, 'temperature_2m_max', 'C'),
          precipitationProbability: getUnit(units, 'precipitation_probability_max', '%'),
          windSpeed: getUnit(units, 'wind_speed_10m_max', 'km/h'),
        },
      };
    });
  }

  private createIncompleteError(): WeatherError {
    return new WeatherError({
      code: 'WEATHER_PROVIDER_INCOMPLETE',
      message: 'A resposta do fornecedor de clima esta incompleta.',
      statusCode: 502,
    });
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getRequiredRecord(record: JsonRecord, key: string): JsonRecord {
  const value = record[key];

  if (!isRecord(value)) {
    throw createIncompleteProviderError();
  }

  return value;
}

function getOptionalRecord(record: JsonRecord, key: string): JsonRecord | undefined {
  const value = record[key];
  return isRecord(value) ? value : undefined;
}

function getRequiredArray(record: JsonRecord, key: string): unknown[] {
  const value = record[key];

  if (!Array.isArray(value)) {
    throw createIncompleteProviderError();
  }

  return value;
}

function getRequiredString(record: JsonRecord, key: string): string {
  const value = record[key];

  if (typeof value !== 'string') {
    throw createIncompleteProviderError();
  }

  return value;
}

function getOptionalString(record: JsonRecord, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function getRequiredNumber(record: JsonRecord, key: string): number {
  const value = getOptionalNumber(record, key);

  if (value === undefined) {
    throw createIncompleteProviderError();
  }

  return value;
}

function getOptionalNumber(record: JsonRecord, key: string): number | undefined {
  const value = record[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getRequiredNumberAt(record: JsonRecord, key: string, index: number): number {
  const value = getOptionalNumberAt(record, key, index);

  if (value === undefined) {
    throw createIncompleteProviderError();
  }

  return value;
}

function getOptionalNumberAt(record: JsonRecord, key: string, index: number): number | undefined {
  const values = record[key];

  if (!Array.isArray(values)) {
    return undefined;
  }

  const value = values[index];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getUnit(units: JsonRecord | undefined, key: string, fallback: string): string {
  if (units === undefined) {
    return fallback;
  }

  return getOptionalString(units, key) ?? fallback;
}

function createIncompleteProviderError(): WeatherError {
  return new WeatherError({
    code: 'WEATHER_PROVIDER_INCOMPLETE',
    message: 'A resposta do fornecedor de clima esta incompleta.',
    statusCode: 502,
  });
}
