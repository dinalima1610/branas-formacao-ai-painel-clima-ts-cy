import { createContext } from 'react'

import type { WeatherLanguage, WeatherMessages } from '@/features/weather/types'

export interface WeatherLanguageContextValue {
  language: WeatherLanguage
  messages: WeatherMessages
  setLanguage(language: WeatherLanguage): void
}

export const WeatherLanguageContext = createContext<WeatherLanguageContextValue | null>(null)
