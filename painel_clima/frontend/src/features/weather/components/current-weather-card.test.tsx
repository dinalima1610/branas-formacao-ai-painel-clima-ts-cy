import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CurrentWeatherCard } from '@/features/weather/components/current-weather-card'
import { weatherSnapshot } from '@/features/weather/test/fixtures'
import { renderWithWeatherLanguage } from '@/features/weather/test/render-with-weather-language'

describe('CurrentWeatherCard', () => {
  it('should render all current weather fields', () => {
    renderWithWeatherLanguage(<CurrentWeatherCard snapshot={weatherSnapshot} unitSystem="metric" />)

    expect(screen.getByText('Curitiba, Parana, Brasil')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '24°C' })).toBeInTheDocument()
    expect(screen.getByText('Céu limpo')).toBeInTheDocument()
    expect(screen.getByText('Sensação térmica')).toBeInTheDocument()
    expect(screen.getByText('23°C')).toBeInTheDocument()
    expect(screen.getByText('Vento')).toBeInTheDocument()
    expect(screen.getByText('12 km/h')).toBeInTheDocument()
    expect(screen.getByText('Umidade')).toBeInTheDocument()
    expect(screen.getByText('64%')).toBeInTheDocument()
    expect(screen.getByText(/Atualizado em/)).toBeInTheDocument()
  })

  it('should render imperial units when selected', () => {
    renderWithWeatherLanguage(<CurrentWeatherCard snapshot={weatherSnapshot} unitSystem="imperial" />)

    expect(screen.getByRole('heading', { name: '75°F' })).toBeInTheDocument()
    expect(screen.getByText('7 mph')).toBeInTheDocument()
  })
})
