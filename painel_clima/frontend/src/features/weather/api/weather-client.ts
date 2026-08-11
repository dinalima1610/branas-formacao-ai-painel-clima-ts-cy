import type {
  City,
  ForecastDay,
  LocationSuggestion,
  LocationOption,
  WeatherIcon,
  WeatherPanelData,
  WeatherRequest,
  WeatherSnapshot,
} from '@/features/weather/types'
import { getApiBaseUrl } from '@/lib/api-base-url'

const DEFAULT_CITY_LIMIT = 5
const OPEN_METEO_URL = 'https://open-meteo.com'

export class WeatherClientError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'WeatherClientError'
    this.status = status
  }
}

export async function searchCities(
  query: string,
  limit = DEFAULT_CITY_LIMIT,
  signal?: AbortSignal,
): Promise<City[]> {
  const normalizedQuery = query.trim()

  if (normalizedQuery.length < 2) {
    return []
  }

  const payload = await requestJson({
    fallbackUrl: createLegacyCitySearchUrl(normalizedQuery),
    signal,
    url: createCitySearchUrl(normalizedQuery, limit),
  })

  return parseCities(payload)
}

export async function getWeather(input: WeatherRequest, signal?: AbortSignal): Promise<WeatherSnapshot> {
  const payload = await requestJson({
    fallbackUrl: createLegacyWeatherUrl(input),
    signal,
    url: createWeatherUrl(input),
  })

  return parseWeatherSnapshot(payload)
}

export async function reverseLocation(lat: number, lon: number, signal?: AbortSignal): Promise<LocationSuggestion> {
  const searchParams = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
  })
  const payload = await requestJson({
    fallbackUrl: `${getWeatherApiBaseUrl()}/api/v0/locations/reverse?${searchParams}`,
    signal,
    url: `${getWeatherApiBaseUrl()}/api/v0/locations/reverse?${searchParams}`,
  })

  return parseLocationSuggestion(payload)
}

interface RequestJsonInput {
  fallbackUrl: string
  signal?: AbortSignal
  url: string
}

async function requestJson(input: RequestJsonInput): Promise<unknown> {
  const response = await fetch(input.url, createRequestInit(input.signal))
  const payload = await readJson(response)

  if (response.ok) {
    return payload
  }

  if (response.status === 404) {
    const fallbackResponse = await fetch(input.fallbackUrl, createRequestInit(input.signal))
    const fallbackPayload = await readJson(fallbackResponse)

    if (fallbackResponse.ok) {
      return fallbackPayload
    }

    throw createClientError(fallbackResponse.status, fallbackPayload)
  }

  throw createClientError(response.status, payload)
}

function createRequestInit(signal?: AbortSignal): RequestInit {
  return {
    headers: {
      Accept: 'application/json',
    },
    signal,
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown
  } catch {
    return null
  }
}

function createClientError(status: number, payload: unknown): WeatherClientError {
  return new WeatherClientError(getErrorMessage(payload), status)
}

function getErrorMessage(payload: unknown): string {
  if (isRecord(payload) && typeof payload.message === 'string') {
    return payload.message
  }

  return 'Nao foi possivel consultar o clima agora. Tente novamente em instantes.'
}

function createCitySearchUrl(query: string, limit: number): string {
  const searchParams = new URLSearchParams({
    limit: String(limit),
    q: query,
  })

  return `${getWeatherApiBaseUrl()}/api/v1/cities/search?${searchParams}`
}

function createLegacyCitySearchUrl(query: string): string {
  const searchParams = new URLSearchParams({
    language: 'pt',
    query,
  })

  return `${getWeatherApiBaseUrl()}/api/v0/locations?${searchParams}`
}

function createWeatherUrl(input: WeatherRequest): string {
  const searchParams = new URLSearchParams({
    lat: String(input.lat),
    lon: String(input.lon),
  })
  const city = input.city

  if (city !== undefined) {
    searchParams.set('cityId', city.id)
    searchParams.set('cityName', city.name)
    searchParams.set('country', city.country)
    searchParams.set('timezone', city.timezone)

    if (city.region !== undefined) {
      searchParams.set('region', city.region)
    }

    if (city.countryCode !== undefined) {
      searchParams.set('countryCode', city.countryCode)
    }

    return `${getWeatherApiBaseUrl()}/api/v1/weather?${searchParams}`
  }

  if (input.cityLabel !== undefined && input.cityLabel.trim().length > 0) {
    searchParams.set('city', input.cityLabel)
  }

  return `${getWeatherApiBaseUrl()}/api/v1/weather?${searchParams}`
}

function createLegacyWeatherUrl(input: WeatherRequest): string {
  const searchParams = new URLSearchParams({
    latitude: String(input.lat),
    longitude: String(input.lon),
  })
  const city = input.city

  if (city !== undefined) {
    searchParams.set('locationId', city.id)
    searchParams.set('locationName', city.name)
    searchParams.set('country', city.country)
    searchParams.set('timezone', city.timezone)

    if (city.region !== undefined) {
      searchParams.set('admin1', city.region)
    }

    if (city.countryCode !== undefined) {
      searchParams.set('countryCode', city.countryCode)
    }
  }

  return `${getWeatherApiBaseUrl()}/api/v0/weather?${searchParams}`
}

function getWeatherApiBaseUrl(): string {
  return getApiBaseUrl()
}

function parseCities(payload: unknown): City[] {
  if (Array.isArray(payload)) {
    return payload.map(parseCity).filter((city): city is City => city !== null)
  }

  if (isRecord(payload) && Array.isArray(payload.cities)) {
    return payload.cities.map(parseCity).filter((city): city is City => city !== null)
  }

  if (isRecord(payload) && Array.isArray(payload.locations)) {
    return payload.locations.map(mapLocationToCity)
  }

  throw new Error('Resposta de cidades invalida.')
}

function parseLocationSuggestion(payload: unknown): LocationSuggestion {
  if (!isRecord(payload) || !isRecord(payload.location)) {
    throw new Error('Resposta de geocodificacao reversa invalida.')
  }

  return {
    confidence: getString(payload.confidence) === 'high' ? 'high' : 'fallback',
    location: parseLocationOption(payload.location),
    message: getString(payload.message) ?? '',
    source: parseLocationSuggestionSource(payload.source),
  }
}

function parseLocationSuggestionSource(source: unknown): LocationSuggestion['source'] {
  if (source === 'google-geocoding' || source === 'openstreetmap') {
    return source
  }

  return 'coordinates'
}

function parseWeatherSnapshot(payload: unknown): WeatherSnapshot {
  if (isCanonicalWeatherSnapshot(payload)) {
    return normalizeWeatherSnapshot(payload)
  }

  if (isLegacyWeatherPanelData(payload)) {
    return mapPanelToSnapshot(payload)
  }

  throw new Error('Resposta de clima invalida.')
}

function normalizeWeatherSnapshot(snapshot: WeatherSnapshot): WeatherSnapshot {
  return {
    attribution: snapshot.attribution,
    city: snapshot.city,
    current: {
      ...snapshot.current,
      icon: normalizeWeatherIcon(snapshot.current.icon, snapshot.current.weatherCode),
    },
    daily: snapshot.daily.map((day) => ({
      ...day,
      icon: normalizeWeatherIcon(day.icon, day.weatherCode),
    })),
  }
}

function mapPanelToSnapshot(panel: WeatherPanelData): WeatherSnapshot {
  return {
    attribution: {
      provider: 'Open-Meteo',
      url: panel.source.url || OPEN_METEO_URL,
    },
    city: mapLocationToCity(panel.location),
    current: {
      description: panel.current.condition,
      feelsLikeC: panel.current.apparentTemperatureCelsius,
      humidityPercent: panel.current.relativeHumidityPercent,
      icon: mapWeatherCodeToIcon(panel.current.weatherCode),
      observedAt: panel.current.measuredAt,
      temperatureC: panel.current.temperatureCelsius,
      weatherCode: panel.current.weatherCode,
      windSpeedKmh: panel.current.windSpeedKmh,
    },
    daily: panel.dailyForecast.map(mapForecastDay),
  }
}

function mapForecastDay(day: WeatherPanelData['dailyForecast'][number]): ForecastDay {
  return {
    date: day.date,
    description: day.condition,
    icon: mapWeatherCodeToIcon(day.weatherCode),
    maxTemperatureC: day.maxTemperatureCelsius,
    minTemperatureC: day.minTemperatureCelsius,
    weatherCode: day.weatherCode,
  }
}

function parseCity(payload: unknown): City | null {
  if (!isRecord(payload)) {
    return null
  }

  const latitude = getNumber(payload.latitude)
  const longitude = getNumber(payload.longitude)
  const name = getString(payload.name)
  const country = getString(payload.country)
  const timezone = getString(payload.timezone)

  if (latitude === null || longitude === null || name === null || country === null || timezone === null) {
    return null
  }

  return {
    country,
    countryCode: getString(payload.countryCode) ?? undefined,
    id: String(payload.id ?? `${name}-${latitude}-${longitude}`),
    latitude,
    longitude,
    name,
    region: getString(payload.region) ?? getString(payload.admin1) ?? undefined,
    timezone,
  }
}

function mapLocationToCity(location: LocationOption): City {
  return {
    country: location.country ?? 'Brasil',
    countryCode: location.countryCode,
    id: location.id,
    latitude: location.latitude,
    longitude: location.longitude,
    name: location.name,
    region: location.admin1,
    timezone: location.timezone ?? 'auto',
  }
}

function parseLocationOption(payload: Record<string, unknown>): LocationOption {
  const latitude = getNumber(payload.latitude)
  const longitude = getNumber(payload.longitude)
  const name = getString(payload.name)

  if (latitude === null || longitude === null || name === null) {
    throw new Error('Resposta de localizacao invalida.')
  }

  return {
    admin1: getString(payload.admin1) ?? undefined,
    country: getString(payload.country) ?? undefined,
    countryCode: getString(payload.countryCode) ?? undefined,
    id: String(payload.id ?? `${name}-${latitude}-${longitude}`),
    latitude,
    longitude,
    name,
    population: getNumber(payload.population) ?? undefined,
    timezone: getString(payload.timezone) ?? undefined,
  }
}

function isCanonicalWeatherSnapshot(payload: unknown): payload is WeatherSnapshot {
  if (!isRecord(payload)) {
    return false
  }

  return (
    isRecord(payload.city) &&
    isRecord(payload.current) &&
    Array.isArray(payload.daily) &&
    isRecord(payload.attribution) &&
    typeof payload.attribution.url === 'string'
  )
}

function isLegacyWeatherPanelData(payload: unknown): payload is WeatherPanelData {
  if (!isRecord(payload)) {
    return false
  }

  return (
    isRecord(payload.location) &&
    isRecord(payload.current) &&
    Array.isArray(payload.dailyForecast) &&
    isRecord(payload.source)
  )
}

function normalizeWeatherIcon(icon: WeatherIcon, weatherCode: number): WeatherIcon {
  if (isWeatherIcon(icon)) {
    return icon
  }

  return mapWeatherCodeToIcon(weatherCode)
}

function isWeatherIcon(value: unknown): value is WeatherIcon {
  return (
    value === 'sun' ||
    value === 'cloud-sun' ||
    value === 'cloud' ||
    value === 'fog' ||
    value === 'cloud-drizzle' ||
    value === 'cloud-rain' ||
    value === 'cloud-snow' ||
    value === 'cloud-lightning' ||
    value === 'cloud-question'
  )
}

function mapWeatherCodeToIcon(weatherCode: number): WeatherIcon {
  if (weatherCode === 0) {
    return 'sun'
  }

  if (weatherCode === 1 || weatherCode === 2) {
    return 'cloud-sun'
  }

  if (weatherCode === 3) {
    return 'cloud'
  }

  if (weatherCode === 45 || weatherCode === 48) {
    return 'fog'
  }

  if (weatherCode >= 51 && weatherCode <= 57) {
    return 'cloud-drizzle'
  }

  if ((weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    return 'cloud-rain'
  }

  if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) {
    return 'cloud-snow'
  }

  if (weatherCode >= 95 && weatherCode <= 99) {
    return 'cloud-lightning'
  }

  return 'cloud-question'
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function getNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
