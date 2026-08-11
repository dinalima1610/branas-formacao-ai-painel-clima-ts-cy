import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { LanguageSelector } from '@/features/weather/components/language-selector'
import { renderWithWeatherLanguage } from '@/features/weather/test/render-with-weather-language'

describe('LanguageSelector', () => {
  afterEach(() => {
    window.localStorage.clear()
  })

  it('should expose accessible language options and selected state', async () => {
    renderWithWeatherLanguage(<LanguageSelector />)

    expect(screen.getByRole('radiogroup', { name: 'Idioma' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Português' })).toHaveAttribute('aria-checked', 'true')

    await userEvent.click(screen.getByRole('radio', { name: 'Inglês' }))

    expect(screen.getByRole('radiogroup', { name: 'Language' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'English' })).toHaveAttribute('aria-checked', 'true')
  })
})
