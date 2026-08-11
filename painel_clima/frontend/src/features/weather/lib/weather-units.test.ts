import { describe, expect, it } from 'vitest'

import {
  convertTemperature,
  convertWindSpeed,
  getTemperatureUnit,
  getWindSpeedUnit,
} from '@/features/weather/lib/weather-units'

describe('weather units', () => {
  it('should convert metric values to imperial values', () => {
    expect(convertTemperature(0, 'imperial')).toBe(32)
    expect(convertWindSpeed(1.609344, 'imperial')).toBe(1)
  })

  it('should preserve metric values and labels', () => {
    expect(convertTemperature(-5, 'metric')).toBe(-5)
    expect(convertWindSpeed(12, 'metric')).toBe(12)
    expect(getTemperatureUnit('metric')).toBe('°C')
    expect(getWindSpeedUnit('metric')).toBe('km/h')
  })
})
