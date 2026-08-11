import { describe, expect, it } from 'vitest'

import { describeWeatherCode } from '@/features/weather/i18n/weather-code-descriptions'

describe('describeWeatherCode', () => {
  it('should describe known WMO codes in Portuguese and English', () => {
    expect(describeWeatherCode(0, 'pt-BR')).toBe('Céu limpo')
    expect(describeWeatherCode(0, 'en-US')).toBe('Clear sky')
    expect(describeWeatherCode(63, 'pt-BR')).toBe('Chuva moderada')
    expect(describeWeatherCode(63, 'en-US')).toBe('Moderate rain')
  })

  it('should describe unknown WMO codes with a localized fallback', () => {
    expect(describeWeatherCode(999, 'pt-BR')).toBe('Condição desconhecida (999)')
    expect(describeWeatherCode(999, 'en-US')).toBe('Unknown condition (999)')
  })
})
