import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useGeolocation } from '@/features/weather/hooks/use-geolocation'

describe('useGeolocation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should request coordinates only when requested', async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success(createPosition())
    })
    mockGeolocation(getCurrentPosition)
    const { result } = renderHook(() => useGeolocation())

    expect(getCurrentPosition).not.toHaveBeenCalled()

    let coordinates: Awaited<ReturnType<typeof result.current.requestLocation>> = null
    await act(async () => {
      coordinates = await result.current.requestLocation()
    })

    expect(getCurrentPosition).toHaveBeenCalledTimes(1)
    expect(coordinates).toEqual({
      latitude: -25.43,
      longitude: -49.27,
    })
    expect(result.current.status).toBe('success')
  })

  it('should map permission denied errors', async () => {
    await expectGeolocationError(createPositionError(1), 'permission-denied')
  })

  it('should map unavailable errors', async () => {
    await expectGeolocationError(createPositionError(2), 'position-unavailable')
  })

  it('should map timeout errors', async () => {
    await expectGeolocationError(createPositionError(3), 'timeout')
  })
})

async function expectGeolocationError(positionError: GeolocationPositionError, expectedCode: string): Promise<void> {
  mockGeolocation(
    vi.fn((_success: PositionCallback, error: PositionErrorCallback | null) => {
      error?.(positionError)
    }),
  )
  const { result } = renderHook(() => useGeolocation())

  await act(async () => {
    await result.current.requestLocation()
  })

  expect(result.current.status).toBe('error')
  expect(result.current.errorCode).toBe(expectedCode)
}

function mockGeolocation(getCurrentPosition: Geolocation['getCurrentPosition']): void {
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

function createPositionError(code: number): GeolocationPositionError {
  return {
    code,
    message: 'Geolocation failed',
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  }
}
