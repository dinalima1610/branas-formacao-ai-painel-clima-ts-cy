export const FORECAST_DAYS = 7;
export const MIN_LOCATION_QUERY_LENGTH = 2;

export interface CoordinatesInput {
  latitude: number;
  longitude: number;
}

export interface SearchLocationsInput {
  query: string;
  language?: string;
}

export interface LocationOption extends CoordinatesInput {
  id: string;
  name: string;
  admin1?: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
  population?: number;
}

export interface LocationContext {
  id?: string;
  name?: string;
  admin1?: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
}

export interface WeatherQueryInput extends CoordinatesInput {
  locationId?: string;
  location?: LocationContext;
}

export interface CurrentWeather {
  measuredAt: string;
  temperatureCelsius: number;
  apparentTemperatureCelsius: number;
  relativeHumidityPercent: number;
  windSpeedKmh: number;
  windDirectionDegrees: number;
  weatherCode: number;
  condition: string;
  units: CurrentWeatherUnits;
}

export interface CurrentWeatherUnits {
  temperature: string;
  apparentTemperature: string;
  relativeHumidity: string;
  windSpeed: string;
  windDirection: string;
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  condition: string;
  minTemperatureCelsius: number;
  maxTemperatureCelsius: number;
  precipitationProbabilityPercent?: number;
  maxWindSpeedKmh?: number;
  units: DailyForecastUnits;
}

export interface DailyForecastUnits {
  temperature: string;
  precipitationProbability?: string;
  windSpeed?: string;
}

export interface WeatherPanelData {
  location: LocationOption;
  current: CurrentWeather;
  dailyForecast: DailyForecast[];
  source: WeatherDataSource;
  generatedAt: string;
}

export interface WeatherDataSource {
  provider: 'open-meteo';
  name: string;
  url: string;
}

export interface LocationSuggestion {
  location: LocationOption;
  source: 'google-geocoding' | 'openstreetmap' | 'coordinates';
  confidence: 'high' | 'fallback';
  message: string;
}

export interface ProviderCurrentWeather {
  measuredAt: string;
  temperatureCelsius: number;
  apparentTemperatureCelsius: number;
  relativeHumidityPercent: number;
  windSpeedKmh: number;
  windDirectionDegrees: number;
  weatherCode: number;
  units: CurrentWeatherUnits;
}

export interface ProviderDailyForecast {
  date: string;
  weatherCode: number;
  minTemperatureCelsius: number;
  maxTemperatureCelsius: number;
  precipitationProbabilityPercent?: number;
  maxWindSpeedKmh?: number;
  units: DailyForecastUnits;
}

export interface ProviderForecast {
  timezone?: string;
  current: ProviderCurrentWeather;
  dailyForecast: ProviderDailyForecast[];
}

export interface WeatherProviderClient {
  searchLocations(query: string, language: string): Promise<LocationOption[]>;
  getForecast(input: CoordinatesInput): Promise<ProviderForecast>;
}

export interface ReverseGeocodingClient {
  findNearestCity(input: CoordinatesInput): Promise<LocationSuggestion | null>;
}

export interface WeatherService {
  searchLocations(input: SearchLocationsInput): Promise<LocationOption[]>;
  reverseLocation(input: CoordinatesInput): Promise<LocationSuggestion>;
  getWeather(input: WeatherQueryInput): Promise<WeatherPanelData>;
}

export interface ApiErrorResponse {
  code: WeatherErrorCode | 'INTERNAL_ERROR';
  message: string;
  details?: Record<string, string | number>;
}

export type WeatherErrorCode =
  | 'INVALID_LOCATION_QUERY'
  | 'INVALID_COORDINATES'
  | 'WEATHER_PROVIDER_UNAVAILABLE'
  | 'WEATHER_PROVIDER_INCOMPLETE'
  | 'LOCATION_NOT_FOUND';

interface WeatherErrorParams {
  code: WeatherErrorCode;
  message: string;
  statusCode: number;
  details?: Record<string, string | number>;
}

export class WeatherError extends Error {
  readonly code: WeatherErrorCode;
  readonly details?: Record<string, string | number>;
  readonly statusCode: number;

  constructor(params: WeatherErrorParams) {
    super(params.message);
    this.name = 'WeatherError';
    this.code = params.code;
    this.statusCode = params.statusCode;
    this.details = params.details;
    Object.setPrototypeOf(this, WeatherError.prototype);
  }
}

export type FetchClient = (input: string | URL, init?: RequestInit) => Promise<Response>;
