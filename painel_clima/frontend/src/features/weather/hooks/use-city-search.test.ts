import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useCitySearch, type SearchCities } from '@/features/weather/hooks/use-city-search'
import { curitibaCity, saoPauloCity } from '@/features/weather/test/fixtures'

describe('useCitySearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce searches', async () => {
    const searcher: SearchCities = vi.fn().mockResolvedValue([curitibaCity])
    const { result } = renderHook(() => useCitySearch('Curitiba', 5, searcher))

    expect(searcher).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(349)
    })

    expect(searcher).not.toHaveBeenCalled()

    await advanceDebounce(1)

    expect(result.current.status).toBe('success')
    expect(result.current.items).toEqual([curitibaCity])
  })

  it('should not dispatch requests for less than 2 characters', () => {
    const searcher: SearchCities = vi.fn().mockResolvedValue([])
    const { result } = renderHook(() => useCitySearch('a', 5, searcher))

    expect(result.current.status).toBe('idle')
    expect(searcher).not.toHaveBeenCalled()
  })

  it('should abort obsolete requests', async () => {
    const signals: AbortSignal[] = []
    const searcher: SearchCities = vi.fn((query, _limit, signal) => {
      signals.push(signal)
      return Promise.resolve(query === 'Cu' ? [curitibaCity] : [saoPauloCity])
    })
    const { rerender } = renderHook(({ query }) => useCitySearch(query, 5, searcher), {
      initialProps: {
        query: 'Cu',
      },
    })

    await act(async () => {
      vi.advanceTimersByTime(350)
    })

    rerender({
      query: 'Sao',
    })

    expect(signals[0].aborted).toBe(true)
  })

  it('should expose errors from the searcher', async () => {
    const searcher: SearchCities = vi.fn().mockRejectedValue(new Error('Falha no provedor.'))
    const { result } = renderHook(() => useCitySearch('Curitiba', 5, searcher))

    await advanceDebounce()

    expect(result.current.status).toBe('error')
    expect(result.current.errorCode).toBe('search-failed')
  })
})

async function advanceDebounce(milliseconds = 350): Promise<void> {
  await act(async () => {
    vi.advanceTimersByTime(milliseconds)
    await Promise.resolve()
    await Promise.resolve()
  })
}
