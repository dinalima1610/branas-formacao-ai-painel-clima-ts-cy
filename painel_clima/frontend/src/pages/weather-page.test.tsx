import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { curitibaCity, weatherSnapshot } from '@/features/weather/test/fixtures'
import { WeatherPage } from '@/pages/weather-page'

describe('WeatherPage', () => {
  afterEach(() => {
    window.localStorage.clear()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('should render the initial empty state in Portuguese', () => {
    mockGeolocationSuccess()
    vi.stubGlobal('fetch', vi.fn())

    render(<WeatherPage />)

    expect(document.documentElement.lang).toBe('pt-BR')
    expect(document.title).toBe('Painel do Clima')
    expect(screen.getByText('Busque uma cidade para ver o clima.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Usar minha localização' })).toBeInTheDocument()
    expect(window.navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled()
  })

  it('should search, select a city and render weather', async () => {
    mockGeolocationSuccess()
    vi.stubGlobal('fetch', createWeatherFetch())

    render(<WeatherPage />)
    await searchAndSelectCity('Curitiba')
    expect(screen.getByRole('combobox', { name: 'Buscar cidade' })).toHaveValue('Curitiba, Parana, Brasil')

    expect(await screen.findByRole('heading', { name: '24°C' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Próximos 7 dias' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(7)
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute('href', 'https://open-meteo.com')
  })

  it('should switch language without losing loaded weather', async () => {
    mockGeolocationSuccess()
    const fetchMock = createWeatherFetch()
    vi.stubGlobal('fetch', fetchMock)

    render(<WeatherPage />)
    await searchAndSelectCity('Curitiba')
    await userEvent.click(screen.getByRole('radio', { name: 'Inglês' }))

    expect(document.documentElement.lang).toBe('en-US')
    expect(screen.getByRole('heading', { name: '24°C' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Next 7 days' })).toBeInTheDocument()
    expect(screen.getAllByText('Clear sky').length).toBeGreaterThan(0)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('should convert weather values when switching to imperial units', async () => {
    mockGeolocationSuccess()
    vi.stubGlobal('fetch', createWeatherFetch())

    render(<WeatherPage />)
    await searchAndSelectCity('Curitiba')
    await userEvent.click(screen.getByRole('radio', { name: '°F / mph' }))

    expect(screen.getByRole('heading', { name: '75°F' })).toBeInTheDocument()
    expect(screen.getByText('7 mph')).toBeInTheDocument()
  })

  it('should load weather from explicit geolocation action', async () => {
    const getCurrentPosition = mockGeolocationSuccess()
    vi.stubGlobal('fetch', createWeatherFetch())

    render(<WeatherPage />)

    expect(getCurrentPosition).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Usar minha localização' }))

    expect(getCurrentPosition).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('combobox', { name: 'Buscar cidade' })).toHaveValue('Curitiba, Parana, Brasil')
    expect(await screen.findByRole('heading', { name: '24°C' })).toBeInTheDocument()
  })

  it('should replace a previous city query with the resolved geolocation label', async () => {
    mockGeolocationSuccess()
    vi.stubGlobal('fetch', createWeatherFetch())

    render(<WeatherPage />)
    await searchAndSelectCity('Curitiba')
    const input = screen.getByRole('combobox', { name: 'Buscar cidade' })
    await userEvent.clear(input)
    await userEvent.type(input, 'Busca anterior')

    await userEvent.click(screen.getByRole('button', { name: 'Usar minha localização' }))

    expect(await screen.findByRole('heading', { name: '24°C' })).toBeInTheDocument()
    expect(input).toHaveValue('Curitiba, Parana, Brasil')
  })

  it('should re-enable geolocation action after resolving the location request', async () => {
    const getCurrentPosition = mockGeolocationSuccess()
    const fetchMock = vi.fn(async (input: unknown) => {
      const url = String(input)

      if (url.includes('/api/v0/locations/reverse')) {
        return createJsonResponse({
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
          source: 'google-geocoding',
        })
      }

      return new Promise<Response>(() => undefined)
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<WeatherPage />)
    const locationButton = screen.getByRole('button', { name: /Usar minha localiza/i })

    await userEvent.click(locationButton)

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/v0/locations/reverse'), expect.any(Object)),
    )
    await waitFor(() => expect(locationButton).toBeEnabled())

    await userEvent.click(locationButton)

    expect(getCurrentPosition).toHaveBeenCalledTimes(2)
  })

  it('should translate current location title after switching from Portuguese to English', async () => {
    mockGeolocationSuccess()
    vi.stubGlobal('fetch', createWeatherFetch())

    render(<WeatherPage />)
    await userEvent.click(screen.getByRole('button', { name: /Usar minha localiza/i }))

    expect(within(await findCurrentWeatherCard()).getByText(/Minha localiza/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: /Ingl/i }))

    expect(within(getCurrentWeatherCard()).getByText('My location - Curitiba, Parana, Brasil')).toBeInTheDocument()
    expect(within(getCurrentWeatherCard()).queryByText(/Minha localiza/i)).not.toBeInTheDocument()
  })

  it('should translate current location title after switching from English to Portuguese', async () => {
    mockGeolocationSuccess()
    vi.stubGlobal('fetch', createWeatherFetch())

    render(<WeatherPage />)
    await userEvent.click(screen.getByRole('radio', { name: /Ingl/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Use my location' }))

    expect(within(await findCurrentWeatherCard()).getByText('My location - Curitiba, Parana, Brasil')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: 'Portuguese' }))

    expect(within(getCurrentWeatherCard()).getByText(/Minha localiza/i)).toBeInTheDocument()
    expect(within(getCurrentWeatherCard()).queryByText('My location')).not.toBeInTheDocument()
  })

  it('should keep current location title translatable when reverse geocoding has no city', async () => {
    mockGeolocationSuccess()
    vi.stubGlobal('fetch', createWeatherFetch({ reverseGeocodingSource: 'coordinates' }))

    render(<WeatherPage />)
    await userEvent.click(screen.getByRole('button', { name: /Usar minha localiza/i }))

    expect(within(await findCurrentWeatherCard()).getByText(/Minha localiza/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: /Ingl/i }))

    expect(within(getCurrentWeatherCard()).getByText(/^My location/)).toBeInTheDocument()
    expect(within(getCurrentWeatherCard()).queryByText(/Minha localiza/i)).not.toBeInTheDocument()
  })

  it('should keep text search available when geolocation is denied', async () => {
    mockGeolocationError(1)
    vi.stubGlobal('fetch', createWeatherFetch())

    render(<WeatherPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Usar minha localização' }))

    expect(await screen.findByText(/Permissão negada/)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Buscar cidade' })).toHaveValue('')

    await searchAndSelectCity('Curitiba')

    expect(await screen.findByRole('heading', { name: '24°C' })).toBeInTheDocument()
  })

  it('should render no city results clearly', async () => {
    mockGeolocationSuccess()
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: unknown) => {
        if (String(input).includes('/api/v1/cities/search')) {
          return createJsonResponse([])
        }

        return createJsonResponse(weatherSnapshot)
      }),
    )

    render(<WeatherPage />)
    await typeCity('Cidade inexistente')

    expect(await screen.findByText('Nenhuma cidade encontrada para esse termo.')).toBeInTheDocument()
  })

  it('should render provider errors and retry the weather request', async () => {
    mockGeolocationSuccess()
    let weatherCalls = 0
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: unknown) => {
        const url = String(input)

        if (url.includes('/api/v1/cities/search')) {
          return createJsonResponse([curitibaCity])
        }

        weatherCalls += 1

        if (weatherCalls === 1) {
          return createJsonResponse(
            {
              code: 'WEATHER_PROVIDER_UNAVAILABLE',
              message: 'Fornecedor indisponível.',
            },
            502,
          )
        }

        return createJsonResponse(weatherSnapshot)
      }),
    )

    render(<WeatherPage />)
    await searchAndSelectCity('Curitiba')

    expect(await screen.findByText('Tente novamente em instantes.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByRole('heading', { name: '24°C' })).toBeInTheDocument()
  })
})

async function searchAndSelectCity(query: string): Promise<void> {
  await typeCity(query)
  await userEvent.click(await screen.findByRole('option', { name: 'Selecionar Curitiba, Parana, Brasil' }))
}

async function typeCity(query: string): Promise<void> {
  const input = screen.getByRole('combobox', { name: 'Buscar cidade' })
  await userEvent.clear(input)
  await userEvent.type(input, query)
}

async function findCurrentWeatherCard(): Promise<HTMLElement> {
  const heading = await screen.findByRole('heading', { name: '24°C' })
  const card = heading.closest('section')

  if (card === null) {
    throw new Error('Current weather card not found.')
  }

  return card
}

function getCurrentWeatherCard(): HTMLElement {
  const heading = screen.getByRole('heading', { name: '24°C' })
  const card = heading.closest('section')

  if (card === null) {
    throw new Error('Current weather card not found.')
  }

  return card
}

interface CreateWeatherFetchOptions {
  reverseGeocodingSource?: 'google-geocoding' | 'coordinates' | 'openstreetmap'
}

function createWeatherFetch(options: CreateWeatherFetchOptions = {}): ReturnType<typeof vi.fn> {
  return vi.fn(async (input: unknown) => {
    const url = String(input)

    if (url.includes('/api/v1/cities/search')) {
      return createJsonResponse([curitibaCity])
    }

    if (url.includes('/api/v0/locations/reverse')) {
      return createJsonResponse({
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
        source: options.reverseGeocodingSource ?? 'google-geocoding',
      })
    }

    return createJsonResponse(weatherSnapshot)
  })
}

function mockGeolocationSuccess(): ReturnType<typeof vi.fn> {
  const getCurrentPosition = vi.fn((success: PositionCallback) => {
    success(createPosition())
  })
  Object.defineProperty(window.navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition,
    },
  })

  return getCurrentPosition
}

function mockGeolocationError(code: number): void {
  const getCurrentPosition = vi.fn((_success: PositionCallback, error: PositionErrorCallback | null) => {
    error?.({
      code,
      message: 'Denied',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    })
  })
  Object.defineProperty(window.navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition,
    },
  })
}

function createPosition(): GeolocationPosition {
  return {
    coords: {
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      latitude: -25.43,
      longitude: -49.27,
      speed: null,
      toJSON: () => ({}),
    },
    timestamp: 1_779_000_000_000,
    toJSON: () => ({}),
  }
}

function createJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    status,
  })
}
