import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import {
  WeatherLanguageProvider,
} from '@/features/weather/i18n/weather-language-provider'
import { useWeatherLanguage } from '@/features/weather/i18n/use-weather-language'
import { renderWithWeatherLanguage } from '@/features/weather/test/render-with-weather-language'

describe('WeatherLanguageProvider', () => {
  afterEach(() => {
    window.localStorage.clear()
  })

  it('should default to Portuguese and update document metadata', () => {
    renderWithWeatherLanguage(<LanguageProbe />)

    expect(screen.getByText('pt-BR')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('pt-BR')
    expect(document.title).toBe('Painel de clima')
  })

  it('should persist language changes', async () => {
    renderWithWeatherLanguage(<LanguageProbe />)

    await userEvent.click(screen.getByRole('button', { name: 'Switch' }))

    expect(screen.getByText('en-US')).toBeInTheDocument()
    expect(window.localStorage.getItem('weather-language')).toBe('en-US')
    expect(document.documentElement.lang).toBe('en-US')
  })

  it('should ignore invalid stored languages', () => {
    window.localStorage.setItem('weather-language', 'invalid')

    render(
      <WeatherLanguageProvider>
        <LanguageProbe />
      </WeatherLanguageProvider>,
    )

    expect(screen.getByText('pt-BR')).toBeInTheDocument()
  })
})

function LanguageProbe() {
  const { language, setLanguage } = useWeatherLanguage()

  return (
    <>
      <span>{language}</span>
      <button onClick={() => setLanguage('en-US')} type="button">
        Switch
      </button>
    </>
  )
}
