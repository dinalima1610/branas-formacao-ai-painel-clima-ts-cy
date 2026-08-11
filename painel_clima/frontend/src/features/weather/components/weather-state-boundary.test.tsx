import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { WeatherStateBoundary } from '@/features/weather/components/weather-state-boundary'
import { renderWithWeatherLanguage } from '@/features/weather/test/render-with-weather-language'

describe('WeatherStateBoundary', () => {
  it('should render the empty state with aria-live', () => {
    renderWithWeatherLanguage(
      <WeatherStateBoundary errorCode={null} onRetry={vi.fn()} status="idle">
        <p>Conteudo</p>
      </WeatherStateBoundary>,
    )

    expect(screen.getByText('Busque uma cidade para ver o clima.')).toBeInTheDocument()
    expect(screen.getByText('Busque uma cidade para ver o clima.').closest('section')).toHaveAttribute(
      'aria-live',
      'polite',
    )
  })

  it('should render loading state', () => {
    renderWithWeatherLanguage(
      <WeatherStateBoundary errorCode={null} onRetry={vi.fn()} status="loading">
        <p>Conteudo</p>
      </WeatherStateBoundary>,
    )

    expect(screen.getByText('Carregando clima atual e previsão.')).toBeInTheDocument()
  })

  it('should render error state and retry action', async () => {
    const onRetry = vi.fn()
    renderWithWeatherLanguage(
      <WeatherStateBoundary errorCode="weather-failed" onRetry={onRetry} status="error">
        <p>Conteudo</p>
      </WeatherStateBoundary>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(screen.getByText('Tente novamente em instantes.')).toBeInTheDocument()
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('should render children on success', () => {
    renderWithWeatherLanguage(
      <WeatherStateBoundary errorCode={null} onRetry={vi.fn()} status="success">
        <p>Conteudo carregado</p>
      </WeatherStateBoundary>,
    )

    expect(screen.getByText('Conteudo carregado')).toBeInTheDocument()
  })
})
