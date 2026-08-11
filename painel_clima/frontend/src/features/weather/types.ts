export interface CoordinatesInput {
  latitude: number
  longitude: number
}

export type WeatherLanguage = 'pt-BR' | 'en-US'
export type UnitSystem = 'metric' | 'imperial'

export interface WeatherMessages {
  attribution: {
    prefix: string
    reverseGeocodingPrefix: string
  }
  current: {
    feelsLike: string
    humidity: string
    updatedAt: string
    wind: string
  }
  forecast: {
    title: string
  }
  geolocation: {
    action: string
    currentLocation: string
    permissionDenied: string
    positionUnavailable: string
    requesting: string
    timeout: string
    unknown: string
    unsupported: string
  }
  language: {
    english: string
    label: string
    portuguese: string
  }
  page: {
    description: string
    eyebrow: string
    heading: string
    searchDescription: string
    title: string
  }
  search: {
    empty: string
    error: string
    fallbackRegion: string
    heading: string
    hint: string
    label: string
    loading: string
    placeholder: string
    resultsLabel: string
    selectCity: string
  }
  state: {
    emptyDescription: string
    emptyTitle: string
    errorDescription: string
    errorTitle: string
    loadingDescription: string
    loadingTitle: string
    retry: string
  }
  units: {
    imperial: string
    label: string
    metric: string
  }
}

export type WeatherIcon =
  | 'sun'
  | 'cloud-sun'
  | 'cloud'
  | 'fog'
  | 'cloud-drizzle'
  | 'cloud-rain'
  | 'cloud-snow'
  | 'cloud-lightning'
  | 'cloud-question'

export interface City {
  id: string
  name: string
  region?: string
  country: string
  countryCode?: string
  latitude: number
  longitude: number
  timezone: string
}

export interface CurrentWeather {
  observedAt: string
  temperatureC: number
  feelsLikeC: number
  weatherCode: number
  description: string
  icon: WeatherIcon
  windSpeedKmh: number
  humidityPercent: number
}

export interface ForecastDay {
  date: string
  minTemperatureC: number
  maxTemperatureC: number
  weatherCode: number
  description: string
  icon: WeatherIcon
}

export interface WeatherSnapshot {
  city: City
  current: CurrentWeather
  daily: ForecastDay[]
  attribution: {
    provider: 'Open-Meteo'
    url: string
  }
}

export interface WeatherRequest {
  city?: City
  cityLabel?: string
  lat: number
  lon: number
}

export interface LocationOption extends CoordinatesInput {
  id: string
  name: string
  admin1?: string
  country?: string
  countryCode?: string
  timezone?: string
  population?: number
}

export interface CurrentWeatherUnits {
  temperature: string
  apparentTemperature: string
  relativeHumidity: string
  windSpeed: string
  windDirection: string
}

export interface PanelCurrentWeather {
  measuredAt: string
  temperatureCelsius: number
  apparentTemperatureCelsius: number
  relativeHumidityPercent: number
  windSpeedKmh: number
  windDirectionDegrees: number
  weatherCode: number
  condition: string
  units: CurrentWeatherUnits
}

export interface DailyForecastUnits {
  temperature: string
  precipitationProbability?: string
  windSpeed?: string
}

export interface DailyForecast {
  date: string
  weatherCode: number
  condition: string
  minTemperatureCelsius: number
  maxTemperatureCelsius: number
  precipitationProbabilityPercent?: number
  maxWindSpeedKmh?: number
  units: DailyForecastUnits
}

export interface WeatherPanelData {
  location: LocationOption
  current: PanelCurrentWeather
  dailyForecast: DailyForecast[]
  source: {
    provider: 'open-meteo'
    name: string
    url: string
  }
  generatedAt: string
}

export interface LocationSuggestion {
  location: LocationOption
  source: 'google-geocoding' | 'openstreetmap' | 'coordinates'
  confidence: 'high' | 'fallback'
  message: string
}

export interface ApiErrorResponse {
  code: string
  message: string
  details?: Record<string, string | number>
}

export interface WeatherApiClient {
  searchLocations(input: SearchLocationsRequest): Promise<LocationOption[]>
  reverseLocation(input: ReverseLocationRequest): Promise<LocationSuggestion>
  getWeather(input: GetWeatherRequest): Promise<WeatherPanelData>
}

export interface SearchLocationsRequest {
  query: string
  language?: string
  signal?: AbortSignal
}

export interface ReverseLocationRequest extends CoordinatesInput {
  signal?: AbortSignal
}

export interface GetWeatherRequest extends CoordinatesInput {
  location?: LocationOption
  signal?: AbortSignal
}

export class WeatherApiError extends Error {
  readonly code: string
  readonly details?: Record<string, string | number>
  readonly status: number

  constructor(status: number, response: ApiErrorResponse) {
    super(response.message)
    this.name = 'WeatherApiError'
    this.code = response.code
    this.details = response.details
    this.status = status
  }
}
