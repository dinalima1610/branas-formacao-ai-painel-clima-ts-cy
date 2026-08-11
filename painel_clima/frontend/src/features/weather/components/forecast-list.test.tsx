import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ForecastList } from '@/features/weather/components/forecast-list'
import { weatherSnapshot } from '@/features/weather/test/fixtures'
import { renderWithWeatherLanguage } from '@/features/weather/test/render-with-weather-language'

describe('ForecastList', () => {
  it('should render 7 forecast days with date, condition and temperatures', () => {
    renderWithWeatherLanguage(<ForecastList days={weatherSnapshot.daily} unitSystem="metric" />)

    expect(screen.getByRole('heading', { name: 'Próximos 7 dias' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(7)
    expect(screen.getAllByText('Céu limpo')).toHaveLength(4)
    expect(screen.getByText('16°C / 26°C')).toBeInTheDocument()
  })

  it('should render converted imperial temperatures', () => {
    renderWithWeatherLanguage(<ForecastList days={weatherSnapshot.daily} unitSystem="imperial" />)

    expect(screen.getByText('61°F / 79°F')).toBeInTheDocument()
  })
})
