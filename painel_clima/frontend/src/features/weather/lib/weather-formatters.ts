import type { UnitSystem, WeatherLanguage } from '@/features/weather/types'
import {
  convertTemperature,
  convertWindSpeed,
  getTemperatureUnit,
  getWindSpeedUnit,
} from '@/features/weather/lib/weather-units'

export interface WeatherFormatters {
  formatDateTime(value: string): string
  formatForecastDate(value: string): string
  formatPercent(value: number): string
  formatTemperature(valueCelsius: number): string
  formatWindSpeed(valueKmh: number): string
}

export function createWeatherFormatters(language: WeatherLanguage, unitSystem: UnitSystem): WeatherFormatters {
  const numberFormat = new Intl.NumberFormat(language, {
    maximumFractionDigits: 0,
  })
  const dateTimeFormat = new Intl.DateTimeFormat(language, {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const forecastDateFormat = new Intl.DateTimeFormat(language, {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
    weekday: 'short',
  })

  return {
    formatDateTime(value) {
      return dateTimeFormat.format(new Date(value))
    },
    formatForecastDate(value) {
      return forecastDateFormat.format(new Date(`${value}T00:00:00.000Z`))
    },
    formatPercent(value) {
      return `${numberFormat.format(value)}%`
    },
    formatTemperature(valueCelsius) {
      return `${numberFormat.format(convertTemperature(valueCelsius, unitSystem))}${getTemperatureUnit(unitSystem)}`
    },
    formatWindSpeed(valueKmh) {
      return `${numberFormat.format(convertWindSpeed(valueKmh, unitSystem))} ${getWindSpeedUnit(unitSystem)}`
    },
  }
}
