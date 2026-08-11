import { useContext } from 'react'

import { WeatherLanguageContext, type WeatherLanguageContextValue } from '@/features/weather/i18n/weather-language-context'

export function useWeatherLanguage(): WeatherLanguageContextValue {
  const value = useContext(WeatherLanguageContext)

  if (value === null) {
    throw new Error('useWeatherLanguage must be used within WeatherLanguageProvider.')
  }

  return value
}
