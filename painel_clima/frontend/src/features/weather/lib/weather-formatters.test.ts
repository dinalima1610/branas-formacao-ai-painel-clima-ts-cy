import { describe, expect, it } from 'vitest'

import { createWeatherFormatters } from '@/features/weather/lib/weather-formatters'

describe('createWeatherFormatters', () => {
  it('should format metric values for Portuguese', () => {
    const formatters = createWeatherFormatters('pt-BR', 'metric')

    expect(formatters.formatTemperature(24.4)).toBe('24°C')
    expect(formatters.formatWindSpeed(12.2)).toBe('12 km/h')
    expect(formatters.formatPercent(64)).toBe('64%')
  })

  it('should format imperial values for English', () => {
    const formatters = createWeatherFormatters('en-US', 'imperial')

    expect(formatters.formatTemperature(0)).toBe('32°F')
    expect(formatters.formatWindSpeed(16.09344)).toBe('10 mph')
    expect(formatters.formatForecastDate('2026-05-13')).toContain('05/13')
  })
})
