import { UpstreamWeatherError } from '../../errors/domain-errors';
import { TemperatureUnit, WindSpeedUnit } from '../../types/weather';

const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const CURRENT_VARIABLES = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'wind_speed_10m',
  'weather_code',
  'is_day'
];
const HOURLY_VARIABLES = ['temperature_2m', 'weather_code'];
const DAILY_VARIABLES = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min'
];
const FORECAST_DAYS = 5;
const SLOW_UPSTREAM_WARNING_MS = 1_000;

export interface ForecastClientInput {
  latitude: number;
  longitude: number;
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
}

export interface OpenMeteoForecastResponse {
  current: {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    isDay: boolean;
    time: string;
  };
  hourly: {
    time: string[];
    temperature: number[];
    weatherCode: number[];
  };
  daily: {
    date: string[];
    temperatureMax: number[];
    temperatureMin: number[];
    weatherCode: number[];
  };
}

interface OpenMeteoForecastClientOptions {
  baseUrl?: string;
  fetchClient?: typeof fetch;
  logger?: Pick<Console, 'warn' | 'error'>;
  timeoutMs?: number;
}

export class OpenMeteoForecastClient {
  private readonly baseUrl: string;
  private readonly fetchClient?: typeof fetch;
  private readonly logger: Pick<Console, 'warn' | 'error'>;
  private readonly timeoutMs: number;

  constructor(options: OpenMeteoForecastClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_FORECAST_URL;
    this.fetchClient = options.fetchClient;
    this.logger = options.logger ?? console;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async getForecast(input: ForecastClientInput): Promise<OpenMeteoForecastResponse> {
    const url = this.buildForecastUrl(input);
    const startedAt = Date.now();
    const endpoint = 'open-meteo-forecast';

    try {
      const response = await this.getFetch()(url, {
        signal: AbortSignal.timeout(this.timeoutMs)
      });
      const durationMs = Date.now() - startedAt;

      if (!response.ok) {
        this.logger.warn({ endpoint, status: response.status, durationMs });
        throw new UpstreamWeatherError('Open-Meteo forecast request failed');
      }

      if (durationMs > SLOW_UPSTREAM_WARNING_MS) {
        this.logger.warn({ endpoint, status: response.status, durationMs });
      }

      const payload = await response.json() as unknown;
      return mapForecastPayload(payload);
    } catch (error) {
      if (error instanceof UpstreamWeatherError) {
        throw error;
      }

      const durationMs = Date.now() - startedAt;
      this.logger.error({ endpoint, status: 'network_error', durationMs });
      throw new UpstreamWeatherError('Open-Meteo forecast request failed');
    }
  }

  private buildForecastUrl(input: ForecastClientInput): string {
    const url = new URL(this.baseUrl);
    url.searchParams.set('latitude', String(input.latitude));
    url.searchParams.set('longitude', String(input.longitude));
    url.searchParams.set('temperature_unit', input.temperatureUnit);
    url.searchParams.set('wind_speed_unit', input.windSpeedUnit);
    url.searchParams.set('current', CURRENT_VARIABLES.join(','));
    url.searchParams.set('hourly', HOURLY_VARIABLES.join(','));
    url.searchParams.set('daily', DAILY_VARIABLES.join(','));
    url.searchParams.set('forecast_hours', '24');
    url.searchParams.set('forecast_days', String(FORECAST_DAYS));
    url.searchParams.set('timezone', 'auto');
    return url.toString();
  }

  private getFetch(): typeof fetch {
    return this.fetchClient ?? globalThis.fetch;
  }
}

const mapForecastPayload = (payload: unknown): OpenMeteoForecastResponse => {
  if (!isRecord(payload)) {
    throw new UpstreamWeatherError('Open-Meteo forecast payload is invalid');
  }

  const current = getRecord(payload.current, 'current');
  const hourly = getRecord(payload.hourly, 'hourly');
  const daily = getRecord(payload.daily, 'daily');

  return {
    current: {
      temperature: getRequiredNumber(current.temperature_2m, 'current.temperature_2m'),
      apparentTemperature: getRequiredNumber(
        current.apparent_temperature,
        'current.apparent_temperature'
      ),
      humidity: getRequiredNumber(current.relative_humidity_2m, 'current.relative_humidity_2m'),
      windSpeed: getRequiredNumber(current.wind_speed_10m, 'current.wind_speed_10m'),
      weatherCode: getRequiredNumber(current.weather_code, 'current.weather_code'),
      isDay: getRequiredNumber(current.is_day, 'current.is_day') === 1,
      time: getRequiredString(current.time, 'current.time')
    },
    hourly: {
      time: getRequiredStringArray(hourly.time, 'hourly.time'),
      temperature: getRequiredNumberArray(hourly.temperature_2m, 'hourly.temperature_2m'),
      weatherCode: getRequiredNumberArray(hourly.weather_code, 'hourly.weather_code')
    },
    daily: {
      date: getRequiredStringArray(daily.time, 'daily.time'),
      temperatureMax: getRequiredNumberArray(daily.temperature_2m_max, 'daily.temperature_2m_max'),
      temperatureMin: getRequiredNumberArray(daily.temperature_2m_min, 'daily.temperature_2m_min'),
      weatherCode: getRequiredNumberArray(daily.weather_code, 'daily.weather_code')
    }
  };
};

const getRecord = (value: unknown, field: string): Record<string, unknown> => {
  if (!isRecord(value)) {
    throw new UpstreamWeatherError(`Open-Meteo forecast ${field} is invalid`);
  }

  return value;
};

const getRequiredNumber = (value: unknown, field: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new UpstreamWeatherError(`Open-Meteo forecast ${field} is invalid`);
  }

  return value;
};

const getRequiredString = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new UpstreamWeatherError(`Open-Meteo forecast ${field} is invalid`);
  }

  return value;
};

const getRequiredNumberArray = (value: unknown, field: string): number[] => {
  if (!Array.isArray(value) || !value.every(isFiniteNumber)) {
    throw new UpstreamWeatherError(`Open-Meteo forecast ${field} is invalid`);
  }

  return value;
};

const getRequiredStringArray = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value) || !value.every(isFilledString)) {
    throw new UpstreamWeatherError(`Open-Meteo forecast ${field} is invalid`);
  }

  return value;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isFiniteNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value);
};

const isFilledString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};
