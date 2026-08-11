import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { UnitSystemToggle } from '@/features/weather/components/unit-system-toggle'
import { renderWithWeatherLanguage } from '@/features/weather/test/render-with-weather-language'

describe('UnitSystemToggle', () => {
  it('should expose metric and imperial options with selected state', async () => {
    const onChange = vi.fn()

    renderWithWeatherLanguage(<UnitSystemToggle onChange={onChange} value="metric" />)

    expect(screen.getByRole('radiogroup', { name: 'Unidades' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '°C / km/h' })).toHaveAttribute('aria-checked', 'true')

    await userEvent.click(screen.getByRole('radio', { name: '°F / mph' }))

    expect(onChange).toHaveBeenCalledWith('imperial')
  })
})
