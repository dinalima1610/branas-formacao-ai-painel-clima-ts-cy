import { useCallback, useEffect, useRef, useState } from 'react'

export type GeolocationStatus = 'idle' | 'requesting' | 'success' | 'error'
export type GeolocationErrorCode = 'permission-denied' | 'position-unavailable' | 'timeout' | 'unsupported' | 'unknown'

export interface GeolocationCoordinates {
  latitude: number
  longitude: number
}

export interface GeolocationState {
  coordinates: GeolocationCoordinates | null
  errorCode: GeolocationErrorCode | null
  requestLocation(): Promise<GeolocationCoordinates | null>
  reset(): void
  status: GeolocationStatus
}

const POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 300_000,
  timeout: 8_000,
}

export function useGeolocation(): GeolocationState {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(null)
  const [errorCode, setErrorCode] = useState<GeolocationErrorCode | null>(null)
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const requestLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setCoordinates(null)
      setErrorCode('unsupported')
      setStatus('error')
      return null
    }

    setCoordinates(null)
    setErrorCode(null)
    setStatus('requesting')

    return new Promise<GeolocationCoordinates | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }

          if (mountedRef.current) {
            setCoordinates(nextCoordinates)
            setErrorCode(null)
            setStatus('success')
          }

          resolve(nextCoordinates)
        },
        (positionError) => {
          const mappedErrorCode = getGeolocationErrorCode(positionError)

          if (mountedRef.current) {
            setCoordinates(null)
            setErrorCode(mappedErrorCode)
            setStatus('error')
          }

          resolve(null)
        },
        POSITION_OPTIONS,
      )
    })
  }, [])

  const reset = useCallback(() => {
    setCoordinates(null)
    setErrorCode(null)
    setStatus('idle')
  }, [])

  return {
    coordinates,
    errorCode,
    requestLocation,
    reset,
    status,
  }
}

function getGeolocationErrorCode(error: GeolocationPositionError): GeolocationErrorCode {
  if (error.code === error.PERMISSION_DENIED) {
    return 'permission-denied'
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return 'position-unavailable'
  }

  if (error.code === error.TIMEOUT) {
    return 'timeout'
  }

  return 'unknown'
}
