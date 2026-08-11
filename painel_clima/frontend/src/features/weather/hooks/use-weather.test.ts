import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useWeather, type GetWeather } from '@/features/weather/hooks/use-weather'
import { curitibaCity, weatherSnapshot } from '@/features/weather/test/fixtures'
import type { WeatherRequest } from '@/features/weather/types'

const weatherRequest: WeatherRequest = {
  city: curitibaCity,
  cityLabel: 'Curitiba, Parana, Brasil',
  lat: curitibaCity.latitude,
  lon: curitibaCity.longitude,
}

describe('useWeather', () => {
  it('should load weather successfully', async () => {
    const loader: GetWeather = vi.fn().mockResolvedValue(weatherSnapshot)
    const { result } = renderHook(() => useWeather(weatherRequest, loader))

    await waitFor(() => expect(result.current.status).toBe('success'))

    expect(result.current.data).toEqual(weatherSnapshot)
    expect(loader).toHaveBeenCalledWith(weatherRequest, expect.any(AbortSignal))
  })

  it('should expose loading and error states', async () => {
    const loader: GetWeather = vi.fn().mockRejectedValue(new Error('Fornecedor indisponivel.'))
    const { result } = renderHook(() => useWeather(weatherRequest, loader))

    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.errorCode).toBe('weather-failed')
  })

  it('should refetch the current request', async () => {
    const loader: GetWeather = vi.fn().mockResolvedValue(weatherSnapshot)
    const { result } = renderHook(() => useWeather(weatherRequest, loader))

    await waitFor(() => expect(result.current.status).toBe('success'))

    act(() => {
      result.current.refetch()
    })

    await waitFor(() => expect(loader).toHaveBeenCalledTimes(2))
  })

  it('should abort the request on unmount', () => {
    const signals: AbortSignal[] = []
    const loader: GetWeather = vi.fn((_input, signal) => {
      signals.push(signal)
      return new Promise<never>(() => undefined)
    })
    const { unmount } = renderHook(() => useWeather(weatherRequest, loader))

    unmount()

    expect(signals[0].aborted).toBe(true)
  })
})
