import { type ReactElement } from 'react'
import { render } from '@testing-library/react'

import { WeatherLanguageProvider } from '@/features/weather/i18n/weather-language-provider'

export function renderWithWeatherLanguage(element: ReactElement) {
  return render(<WeatherLanguageProvider>{element}</WeatherLanguageProvider>)
}
