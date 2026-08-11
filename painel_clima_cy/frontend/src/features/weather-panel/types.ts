export const temperatureUnits = ['celsius', 'fahrenheit'] as const;

export type TemperatureUnit = (typeof temperatureUnits)[number];

export type WindSpeedUnit = 'kmh' | 'mph';

export type WeatherIconKey =
  | 'sunny'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunderstorm'
  | 'unknown';

export interface PlaceCandidate {
  id: string;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  label: string;
}

export interface WeatherQuery {
  latitude: number;
  longitude: number;
  temperatureUnit: TemperatureUnit;
}

export interface CurrentConditions {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windSpeedUnit: WindSpeedUnit;
  weatherCode: number;
  conditionLabel: string;
  conditionIconKey: WeatherIconKey;
  isDay: boolean;
}

export interface HourlyForecastSlot {
  time: string;
  temperature: number;
  weatherCode: number;
  conditionLabel: string;
  conditionIconKey: WeatherIconKey;
}

export interface DailyForecastSlot {
  date: string;
  temperatureMin: number;
  temperatureMax: number;
  weatherCode: number;
  conditionLabel: string;
  conditionIconKey: WeatherIconKey;
}

export interface WeatherPanelPayload {
  place: PlaceCandidate;
  current: CurrentConditions;
  hourly: HourlyForecastSlot[];
  daily: DailyForecastSlot[];
  meta: {
    fetchedAt: string;
    temperatureUnit: TemperatureUnit;
  };
}

export type WeatherApiErrorCode =
  | 'INVALID_QUERY'
  | 'PLACE_NOT_FOUND'
  | 'UPSTREAM_WEATHER_ERROR'
  | 'UPSTREAM_GEOCODING_UNAVAILABLE'
  | 'UPSTREAM_WEATHER_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  | 'UNKNOWN_ERROR';

export interface WeatherApiErrorBody {
  code: WeatherApiErrorCode;
  message: string;
}
