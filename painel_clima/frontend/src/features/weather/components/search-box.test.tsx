import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SearchBox } from '@/features/weather/components/search-box'
import { curitibaCity, saoPauloCity } from '@/features/weather/test/fixtures'
import { renderWithWeatherLanguage } from '@/features/weather/test/render-with-weather-language'

describe('SearchBox', () => {
  it('should render an accessible combobox and city options', () => {
    renderWithWeatherLanguage(
      <SearchBox
        errorCode={null}
        items={[curitibaCity]}
        onQueryChange={vi.fn()}
        onSelect={vi.fn()}
        query="Curitiba"
        status="success"
      />,
    )

    expect(screen.getByLabelText('Cidade')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Buscar cidade' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox', { name: 'Resultados de cidades' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Selecionar Curitiba, Parana, Brasil' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('should call onQueryChange when typing', async () => {
    const onQueryChange = vi.fn()
    renderWithWeatherLanguage(
      <SearchBox
        errorCode={null}
        items={[]}
        onQueryChange={onQueryChange}
        onSelect={vi.fn()}
        query=""
        status="idle"
      />,
    )

    await userEvent.type(screen.getByRole('combobox', { name: 'Buscar cidade' }), 'Rio')

    expect(onQueryChange).toHaveBeenCalled()
  })

  it('should select options with keyboard navigation', async () => {
    const onSelect = vi.fn()
    renderWithWeatherLanguage(
      <SearchBox
        errorCode={null}
        items={[curitibaCity, saoPauloCity]}
        onQueryChange={vi.fn()}
        onSelect={onSelect}
        query="S"
        status="success"
      />,
    )

    screen.getByRole('combobox', { name: 'Buscar cidade' }).focus()
    await userEvent.keyboard('{ArrowDown}{Enter}')

    expect(onSelect).toHaveBeenCalledWith(saoPauloCity)
  })
})
