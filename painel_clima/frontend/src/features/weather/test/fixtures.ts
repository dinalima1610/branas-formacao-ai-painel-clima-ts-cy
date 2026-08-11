import type {
  City,
  DailyForecast,
  ForecastDay,
  LocationOption,
  LocationSuggestion,
  WeatherPanelData,
  WeatherSnapshot,
} from '@/features/weather/types'

export const saoPauloLocation: LocationOption = {
  admin1: 'Sao Paulo',
  country: 'Brasil',
  countryCode: 'BR',
  id: 'sao-paulo-br',
  latitude: -23.55,
  longitude: -46.63,
  name: 'Sao Paulo',
  timezone: 'America/Sao_Paulo',
}

export const curitibaLocation: LocationOption = {
  admin1: 'Parana',
  country: 'Brasil',
  countryCode: 'BR',
  id: 'curitiba-br',
  latitude: -25.43,
  longitude: -49.27,
  name: 'Curitiba',
  timezone: 'America/Sao_Paulo',
}

export const curitibaCity: City = {
  country: 'Brasil',
  countryCode: 'BR',
  id: 'curitiba-br',
  latitude: -25.43,
  longitude: -49.27,
  name: 'Curitiba',
  region: 'Parana',
  timezone: 'America/Sao_Paulo',
}

export const saoPauloCity: City = {
  country: 'Brasil',
  countryCode: 'BR',
  id: 'sao-paulo-br',
  latitude: -23.55,
  longitude: -46.63,
  name: 'Sao Paulo',
  region: 'Sao Paulo',
  timezone: 'America/Sao_Paulo',
}

export const coordinateSuggestion: LocationSuggestion = {
  confidence: 'fallback',
  location: saoPauloLocation,
  message: 'Use as coordenadas autorizadas pelo navegador para consultar o clima.',
  source: 'coordinates',
}

export const weatherPanelData: WeatherPanelData = {
  current: {
    apparentTemperatureCelsius: 23,
    condition: 'Ceu limpo',
    measuredAt: '2026-05-13T15:00:00.000Z',
    relativeHumidityPercent: 64,
    temperatureCelsius: 24,
    units: {
      apparentTemperature: '\u00B0C',
      relativeHumidity: '%',
      temperature: '\u00B0C',
      windDirection: '\u00B0',
      windSpeed: 'km/h',
    },
    weatherCode: 0,
    windDirectionDegrees: 90,
    windSpeedKmh: 12,
  },
  dailyForecast: createDailyForecasts(),
  generatedAt: '2026-05-13T15:05:00.000Z',
  location: curitibaLocation,
  source: {
    name: 'Open-Meteo',
    provider: 'open-meteo',
    url: 'https://open-meteo.com/',
  },
}

export const weatherSnapshot: WeatherSnapshot = {
  attribution: {
    provider: 'Open-Meteo',
    url: 'https://open-meteo.com',
  },
  city: curitibaCity,
  current: {
    description: 'Ceu limpo',
    feelsLikeC: 23,
    humidityPercent: 64,
    icon: 'sun',
    observedAt: '2026-05-13T15:00:00.000Z',
    temperatureC: 24,
    weatherCode: 0,
    windSpeedKmh: 12,
  },
  daily: createForecastDays(),
}

function createDailyForecasts(): DailyForecast[] {
  return Array.from({ length: 7 }, (_, index) => ({
    condition: index % 2 === 0 ? 'Ceu limpo' : 'Parcialmente nublado',
    date: `2026-05-${String(14 + index).padStart(2, '0')}`,
    maxTemperatureCelsius: 26 + index,
    maxWindSpeedKmh: 15 + index,
    minTemperatureCelsius: 16 + index,
    precipitationProbabilityPercent: 10 + index,
    units: {
      precipitationProbability: '%',
      temperature: '\u00B0C',
      windSpeed: 'km/h',
    },
    weatherCode: index % 2 === 0 ? 0 : 2,
  }))
}

function createForecastDays(): ForecastDay[] {
  return Array.from({ length: 7 }, (_, index) => ({
    date: `2026-05-${String(14 + index).padStart(2, '0')}`,
    description: index % 2 === 0 ? 'Ceu limpo' : 'Parcialmente nublado',
    icon: index % 2 === 0 ? 'sun' : 'cloud-sun',
    maxTemperatureC: 26 + index,
    minTemperatureC: 16 + index,
    weatherCode: index % 2 === 0 ? 0 : 2,
  }))
}
