import type { UnitSystem } from '@/features/weather/types'

export const UNIT_SYSTEMS: UnitSystem[] = ['metric', 'imperial']

export function convertTemperature(valueCelsius: number, unitSystem: UnitSystem): number {
  if (unitSystem === 'imperial') {
    return (valueCelsius * 9) / 5 + 32
  }

  return valueCelsius
}

export function convertWindSpeed(valueKmh: number, unitSystem: UnitSystem): number {
  if (unitSystem === 'imperial') {
    return valueKmh / 1.609344
  }

  return valueKmh
}

export function getTemperatureUnit(unitSystem: UnitSystem): '°C' | '°F' {
  return unitSystem === 'imperial' ? '°F' : '°C'
}

export function getWindSpeedUnit(unitSystem: UnitSystem): 'km/h' | 'mph' {
  return unitSystem === 'imperial' ? 'mph' : 'km/h'
}
