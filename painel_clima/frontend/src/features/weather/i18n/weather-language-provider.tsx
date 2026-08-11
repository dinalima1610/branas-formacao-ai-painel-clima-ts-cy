import { type ReactNode, useEffect, useMemo, useState } from 'react'

import type { WeatherLanguage } from '@/features/weather/types'
import { WeatherLanguageContext, type WeatherLanguageContextValue } from '@/features/weather/i18n/weather-language-context'
import { DEFAULT_WEATHER_LANGUAGE, isWeatherLanguage, weatherTranslations } from '@/features/weather/i18n/translations'

const STORAGE_KEY = 'weather-language'

let memoryLanguage: WeatherLanguage = DEFAULT_WEATHER_LANGUAGE

interface WeatherLanguageProviderProps {
  children: ReactNode
}

export function WeatherLanguageProvider({ children }: WeatherLanguageProviderProps) {
  const [language, setLanguageState] = useState(readStoredLanguage)
  const messages = weatherTranslations[language]

  useEffect(() => {
    document.documentElement.lang = language
    document.title = messages.page.title
    updateMetaDescription(messages.page.description)
  }, [language, messages.page.description, messages.page.title])

  const value = useMemo<WeatherLanguageContextValue>(() => ({
    language,
    messages,
    setLanguage(nextLanguage) {
      setLanguageState(nextLanguage)
      writeStoredLanguage(nextLanguage)
    },
  }), [language, messages])

  return <WeatherLanguageContext.Provider value={value}>{children}</WeatherLanguageContext.Provider>
}

function readStoredLanguage(): WeatherLanguage {
  try {
    const storedLanguage = window.localStorage.getItem(STORAGE_KEY)

    if (storedLanguage !== null && isWeatherLanguage(storedLanguage)) {
      memoryLanguage = storedLanguage
      return storedLanguage
    }
  } catch {
    return memoryLanguage
  }

  return DEFAULT_WEATHER_LANGUAGE
}

function writeStoredLanguage(language: WeatherLanguage): void {
  memoryLanguage = language

  try {
    window.localStorage.setItem(STORAGE_KEY, language)
  } catch {
    return
  }
}

function updateMetaDescription(content: string): void {
  const currentDescription = document.querySelector('meta[name="description"]')

  if (currentDescription instanceof HTMLMetaElement) {
    currentDescription.content = content
    return
  }

  const description = document.createElement('meta')
  description.name = 'description'
  description.content = content
  document.head.append(description)
}
