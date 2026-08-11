import { afterEach, describe, expect, it, vi } from 'vitest'

import { getWeather, reverseLocation, searchCities } from '@/features/weather/api/weather-client'
import { curitibaCity, weatherPanelData, weatherSnapshot } from '@/features/weather/test/fixtures'

describe('weather-client', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('should call city search through VITE_API_URL', async () => {
    vi.stubEnv('VITE_API_URL', 'http://api.test')
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse([curitibaCity]))
    vi.stubGlobal('fetch', fetchMock)

    const cities = await searchCities('Curitiba', 7)

    expect(cities).toEqual([curitibaCity])
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/api/v1/cities/search?limit=7&q=Curitiba',
      expect.objectContaining({
        headers: {
          Accept: 'application/json',
        },
      }),
    )
  })

  it('should call weather through VITE_API_URL', async () => {
    vi.stubEnv('VITE_API_URL', 'http://api.test/')
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(weatherSnapshot))
    vi.stubGlobal('fetch', fetchMock)

    await getWeather({
      city: curitibaCity,
      cityLabel: 'Curitiba, Parana, Brasil',
      lat: curitibaCity.latitude,
      lon: curitibaCity.longitude,
    })

    expect(String(fetchMock.mock.calls[0][0])).toBe(
      'http://api.test/api/v1/weather?lat=-25.43&lon=-49.27&cityId=curitiba-br&cityName=Curitiba&country=Brasil&timezone=America%2FSao_Paulo&region=Parana&countryCode=BR',
    )
  })

  it('should call reverse geocoding through VITE_API_URL', async () => {
    vi.stubEnv('VITE_API_URL', 'http://api.test')
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse({
        confidence: 'high',
        location: {
          admin1: 'Parana',
          country: 'Brasil',
          countryCode: 'BR',
          id: 'coordinates:-25.4300,-49.2700',
          latitude: -25.43,
          longitude: -49.27,
          name: 'Curitiba',
          timezone: 'America/Sao_Paulo',
        },
        message: 'Localizacao encontrada.',
        source: 'openstreetmap',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const suggestion = await reverseLocation(-25.43, -49.27)

    expect(suggestion.location.name).toBe('Curitiba')
    expect(suggestion.location.admin1).toBe('Parana')
    expect(suggestion.location.country).toBe('Brasil')
    expect(suggestion.source).toBe('openstreetmap')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/api/v0/locations/reverse?latitude=-25.43&longitude=-49.27',
      expect.objectContaining({
        headers: {
          Accept: 'application/json',
        },
      }),
    )
  })

  it('should map the current backend payload when v1 is unavailable', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse({ message: 'Not found' }, 404))
      .mockResolvedValueOnce(createJsonResponse(weatherPanelData))
    vi.stubGlobal('fetch', fetchMock)

    const snapshot = await getWeather({
      city: curitibaCity,
      cityLabel: 'Curitiba',
      lat: curitibaCity.latitude,
      lon: curitibaCity.longitude,
    })

    expect(snapshot.city.name).toBe('Curitiba')
    expect(snapshot.current.temperatureC).toBe(24)
    expect(snapshot.daily).toHaveLength(7)
    expect(String(fetchMock.mock.calls[1][0])).toContain('/api/v0/weather?')
  })

  it('should surface non-ok backend errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        createJsonResponse(
          {
            error: 'provider_unavailable',
            message: 'Fornecedor indisponivel.',
          },
          502,
        ),
      ),
    )

    await expect(
      getWeather({
        lat: -25.43,
        lon: -49.27,
      }),
    ).rejects.toMatchObject({
      message: 'Fornecedor indisponivel.',
      status: 502,
    })
  })
})

function createJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    status,
  })
}
