import { useCallback, useEffect, useState } from 'react'

import { getWeather } from '@/features/weather/api/weather-client'
import type { WeatherRequest, WeatherSnapshot } from '@/features/weather/types'

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error'
export type WeatherLoadErrorCode = 'weather-failed'

export interface WeatherState {
  data: WeatherSnapshot | null
  errorCode: WeatherLoadErrorCode | null
  refetch(): void
  status: WeatherStatus
}

export type GetWeather = (input: WeatherRequest, signal: AbortSignal) => Promise<WeatherSnapshot>

export function useWeather(input: WeatherRequest | null, loader: GetWeather = getWeather): WeatherState {
  const [data, setData] = useState<WeatherSnapshot | null>(null)
  const [errorCode, setErrorCode] = useState<WeatherLoadErrorCode | null>(null)
  const [status, setStatus] = useState<WeatherStatus>('idle')
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (input === null) {
      setData(null)
      setErrorCode(null)
      setStatus('idle')
      return
    }

    let ignore = false
    const abortController = new AbortController()

    setErrorCode(null)
    setStatus('loading')

    void loader(input, abortController.signal)
      .then((snapshot) => {
        if (ignore) {
          return
        }

        setData(snapshot)
        setErrorCode(null)
        setStatus('success')
      })
      .catch((loadError: unknown) => {
        if (ignore || (loadError instanceof Error && loadError.name === 'AbortError')) {
          return
        }

        setData(null)
        setErrorCode(getWeatherErrorCode())
        setStatus('error')
      })

    return () => {
      ignore = true
      abortController.abort()
    }
  }, [input, loader, reloadToken])

  const refetch = useCallback(() => {
    setReloadToken((currentToken) => currentToken + 1)
  }, [])

  return {
    data,
    errorCode,
    refetch,
    status,
  }
}

function getWeatherErrorCode(): WeatherLoadErrorCode {
  return 'weather-failed'
}
