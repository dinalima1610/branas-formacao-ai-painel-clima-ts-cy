import { describe, expect, it } from 'vitest'

import { WEATHER_LANGUAGES, weatherTranslations } from '@/features/weather/i18n/translations'

describe('weatherTranslations', () => {
  it('should keep the same non-empty message keys for every language', () => {
    const [baseLanguage, ...languages] = WEATHER_LANGUAGES
    const baseKeys = collectKeys(weatherTranslations[baseLanguage])

    languages.forEach((language) => {
      expect(collectKeys(weatherTranslations[language])).toEqual(baseKeys)
      expect(baseKeys.every((key) => getValue(weatherTranslations[language], key).trim().length > 0)).toBe(true)
    })
  })
})

function collectKeys(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, childValue]) => {
    const path = prefix.length === 0 ? key : `${prefix}.${key}`

    if (typeof childValue === 'string') {
      return [path]
    }

    return collectKeys(childValue as object, path)
  })
}

function getValue(value: object, path: string): string {
  return path.split('.').reduce<unknown>((currentValue, key) => {
    if (typeof currentValue === 'object' && currentValue !== null && key in currentValue) {
      return (currentValue as Record<string, unknown>)[key]
    }

    return ''
  }, value) as string
}
