import { useState } from 'react'
import { LocateFixed } from 'lucide-react'

import { CurrentWeatherCard } from '@/features/weather/components/current-weather-card'
import { ForecastList } from '@/features/weather/components/forecast-list'
import { LanguageSelector } from '@/features/weather/components/language-selector'
import { SearchBox } from '@/features/weather/components/search-box'
import { UnitSystemToggle } from '@/features/weather/components/unit-system-toggle'
import { WeatherStateBoundary } from '@/features/weather/components/weather-state-boundary'
import { reverseLocation } from '@/features/weather/api/weather-client'
import { WeatherLanguageProvider } from '@/features/weather/i18n/weather-language-provider'
import { useWeatherLanguage } from '@/features/weather/i18n/use-weather-language'
import { useCitySearch } from '@/features/weather/hooks/use-city-search'
import { useGeolocation, type GeolocationErrorCode } from '@/features/weather/hooks/use-geolocation'
import { useWeather } from '@/features/weather/hooks/use-weather'
import type { City, LocationSuggestion, UnitSystem, WeatherRequest } from '@/features/weather/types'

const OPEN_METEO_URL = 'https://open-meteo.com'

export function WeatherPage() {
  return (
    <WeatherLanguageProvider>
      <WeatherPageContent />
    </WeatherLanguageProvider>
  )
}

function WeatherPageContent() {
  const { messages } = useWeatherLanguage()
  const [query, setQuery] = useState('')
  const [currentLocationCity, setCurrentLocationCity] = useState<City | null>(null)
  const [currentLocationSource, setCurrentLocationSource] = useState<LocationSuggestion['source'] | null>(null)
  const [isCurrentLocationWeather, setIsCurrentLocationWeather] = useState(false)
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false)
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric')
  const [weatherRequest, setWeatherRequest] = useState<WeatherRequest | null>(null)
  const citySearch = useCitySearch(query)
  const geolocation = useGeolocation()
  const weather = useWeather(weatherRequest)
  const selectedCityLabel = weatherRequest?.city === undefined ? null : formatCityLabel(weatherRequest.city)
  const isShowingSelectedCity = selectedCityLabel !== null && query === selectedCityLabel
  const searchItems = isShowingSelectedCity ? [] : citySearch.items
  const searchStatus = isShowingSelectedCity ? 'idle' : citySearch.status
  const attributionUrl = weather.data?.attribution.url ?? OPEN_METEO_URL
  const currentWeatherCityName = isCurrentLocationWeather
    ? formatCurrentLocationTitle(messages.geolocation.currentLocation, currentLocationCity, weather.data?.city)
    : undefined

  function handleSelectCity(city: City): void {
    const cityLabel = formatCityLabel(city)
    setCurrentLocationCity(null)
    setCurrentLocationSource(null)
    setIsCurrentLocationWeather(false)
    setQuery(cityLabel)
    setWeatherRequest({
      city,
      cityLabel,
      lat: city.latitude,
      lon: city.longitude,
    })
  }

  async function handleUseCurrentLocation(): Promise<void> {
    if (isUsingCurrentLocation) {
      return
    }

    setIsUsingCurrentLocation(true)

    try {
      const coordinates = await geolocation.requestLocation()

      if (coordinates === null) {
        return
      }

      const currentLocation = await getCurrentLocationCity(coordinates)
      const currentCity = currentLocation?.city ?? null
      const cityLabel = currentCity === null ? messages.geolocation.currentLocation : formatCityLabel(currentCity)
      setCurrentLocationCity(currentCity)
      setCurrentLocationSource(currentLocation?.source ?? null)
      setIsCurrentLocationWeather(true)
      setWeatherRequest({
        city: currentCity ?? undefined,
        cityLabel,
        lat: coordinates.latitude,
        lon: coordinates.longitude,
      })
    } finally {
      setIsUsingCurrentLocation(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f5] text-[#141413]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="grid gap-3">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#a9583e]">{messages.page.eyebrow}</p>
              <h1 className="mt-3 font-serif text-4xl font-normal leading-tight text-[#141413] sm:text-5xl">
                {messages.page.heading}
              </h1>
              <p className="mt-3 text-base leading-7 text-[#3d3d3a]" id="weather-search-description">
                {messages.page.searchDescription}
              </p>
            </div>
            <LanguageSelector />
          </div>
        </header>

        <section
          aria-labelledby="weather-search-heading"
          className="grid gap-4 rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-4 sm:p-5"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-[#141413]" id="weather-search-heading">
                {messages.search.heading}
              </h2>
              <p className="mt-1 text-sm text-[#5f5b54]">{messages.search.hint}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <UnitSystemToggle onChange={setUnitSystem} value={unitSystem} />
              <button
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#a9583e] bg-[#faf9f5] px-4 text-sm font-medium text-[#141413] transition-colors hover:bg-[#f5f0e8] focus:outline-none focus:ring-4 focus:ring-[#a9583e]/25 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isUsingCurrentLocation}
                onClick={() => {
                  void handleUseCurrentLocation()
                }}
                type="button"
              >
                <LocateFixed aria-hidden="true" className="size-4 text-[#a9583e]" />
                {isUsingCurrentLocation ? messages.geolocation.requesting : messages.geolocation.action}
              </button>
            </div>
          </div>

          <SearchBox
            errorCode={citySearch.errorCode}
            items={searchItems}
            onQueryChange={setQuery}
            onSelect={handleSelectCity}
            query={query}
            status={searchStatus}
          />

          {geolocation.status === 'error' && geolocation.errorCode !== null && (
            <p aria-live="polite" className="text-sm text-[#c64545]" role="status">
              {getGeolocationMessage(geolocation.errorCode, messages.geolocation)}
            </p>
          )}
        </section>

        <WeatherStateBoundary errorCode={weather.errorCode} onRetry={weather.refetch} status={weather.status}>
          {weather.data !== null && (
            <div className="grid gap-4">
              <CurrentWeatherCard cityName={currentWeatherCityName} snapshot={weather.data} unitSystem={unitSystem} />
              <ForecastList days={weather.data.daily} unitSystem={unitSystem} />
            </div>
          )}
        </WeatherStateBoundary>

        <p className="text-sm text-[#6c6a64]">
          {messages.attribution.prefix}{' '}
          <a className="font-medium text-[#a9583e] underline-offset-4 hover:underline" href={attributionUrl}>
            Open-Meteo
          </a>
          {currentLocationSource === 'openstreetmap' && (
            <>
              {' '}
              {messages.attribution.reverseGeocodingPrefix}{' '}
              <a className="font-medium text-[#a9583e] underline-offset-4 hover:underline" href="https://www.openstreetmap.org/copyright">
                OpenStreetMap
              </a>
            </>
          )}
          .
        </p>
      </section>
    </main>
  )
}

function formatCityLabel(city: City): string {
  return [city.name, city.region, city.country].filter(Boolean).join(', ')
}

function formatCurrentLocationTitle(currentLocationLabel: string, currentLocationCity: City | null, snapshotCity?: City): string {
  const locationDetails = getDisplayableLocationDetails(currentLocationCity) ?? getDisplayableLocationDetails(snapshotCity)

  if (locationDetails === undefined) {
    return currentLocationLabel
  }

  return `${currentLocationLabel} - ${locationDetails}`
}

function getDisplayableLocationDetails(city?: City | null): string | undefined {
  if (city == null || isGenericCurrentLocationName(city.name)) {
    return undefined
  }

  const label = formatCityLabel(city)
  return label.length > 0 && label !== city.country ? label : undefined
}

function isGenericCurrentLocationName(name: string): boolean {
  const normalizedName = normalizeLocationName(name)
  return (
    normalizedName === 'localizacao atual' ||
    normalizedName === 'localizacao selecionada' ||
    normalizedName === 'minha localizacao' ||
    normalizedName === 'my location'
  )
}

function normalizeLocationName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

interface CurrentLocationResult {
  city: City
  source: LocationSuggestion['source']
}

async function getCurrentLocationCity(coordinates: { latitude: number; longitude: number }): Promise<CurrentLocationResult | null> {
  try {
    const suggestion = await reverseLocation(coordinates.latitude, coordinates.longitude)

    if (suggestion.source === 'coordinates' || isGenericCurrentLocationName(suggestion.location.name)) {
      return null
    }

    return {
      city: {
        country: suggestion.location.country ?? '',
        countryCode: suggestion.location.countryCode,
        id: suggestion.location.id,
        latitude: suggestion.location.latitude,
        longitude: suggestion.location.longitude,
        name: suggestion.location.name,
        region: suggestion.location.admin1,
        timezone: suggestion.location.timezone ?? 'auto',
      },
      source: suggestion.source,
    }
  } catch {
    return null
  }
}

function getGeolocationMessage(
  errorCode: GeolocationErrorCode,
  messages: ReturnType<typeof useWeatherLanguage>['messages']['geolocation'],
): string {
  if (errorCode === 'permission-denied') {
    return messages.permissionDenied
  }

  if (errorCode === 'position-unavailable') {
    return messages.positionUnavailable
  }

  if (errorCode === 'timeout') {
    return messages.timeout
  }

  if (errorCode === 'unsupported') {
    return messages.unsupported
  }

  return messages.unknown
}
