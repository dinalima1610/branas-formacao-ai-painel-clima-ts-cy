import { useEffect, useState } from 'react'

import { searchCities } from '@/features/weather/api/weather-client'
import type { City } from '@/features/weather/types'

const MIN_QUERY_LENGTH = 2
const SEARCH_DEBOUNCE_MS = 350

export type CitySearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'
export type CitySearchErrorCode = 'search-failed'

export interface CitySearchState {
  errorCode: CitySearchErrorCode | null
  items: City[]
  status: CitySearchStatus
}

export type SearchCities = (query: string, limit: number, signal: AbortSignal) => Promise<City[]>

const INITIAL_STATE: CitySearchState = {
  errorCode: null,
  items: [],
  status: 'idle',
}

export function useCitySearch(query: string, limit = 5, searcher: SearchCities = searchCities): CitySearchState {
  const [state, setState] = useState<CitySearchState>(INITIAL_STATE)

  useEffect(() => {
    const normalizedQuery = query.trim()

    if (normalizedQuery.length < MIN_QUERY_LENGTH) {
      setState(INITIAL_STATE)
      return
    }

    let ignore = false
    const abortController = new AbortController()
    const timeoutId = window.setTimeout(() => {
      setState({
        errorCode: null,
        items: [],
        status: 'loading',
      })

      void searcher(normalizedQuery, limit, abortController.signal)
        .then((cities) => {
          if (ignore) {
            return
          }

          setState({
            errorCode: null,
            items: cities,
            status: cities.length > 0 ? 'success' : 'empty',
          })
        })
        .catch((error: unknown) => {
          if (ignore || (error instanceof Error && error.name === 'AbortError')) {
            return
          }

          setState({
            errorCode: getSearchErrorCode(),
            items: [],
            status: 'error',
          })
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      ignore = true
      window.clearTimeout(timeoutId)
      abortController.abort()
    }
  }, [limit, query, searcher])

  return state
}

function getSearchErrorCode(): CitySearchErrorCode {
  return 'search-failed'
}
