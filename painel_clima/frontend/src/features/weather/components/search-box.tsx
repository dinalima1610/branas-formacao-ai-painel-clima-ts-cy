import { type KeyboardEvent, useEffect, useId, useState } from 'react'
import { Loader2, MapPin, Search } from 'lucide-react'

import { useWeatherLanguage } from '@/features/weather/i18n/use-weather-language'
import type { City } from '@/features/weather/types'
import type { CitySearchErrorCode } from '@/features/weather/hooks/use-city-search'

interface SearchBoxProps {
  errorCode: CitySearchErrorCode | null
  items: City[]
  onQueryChange(query: string): void
  onSelect(city: City): void
  query: string
  status: 'idle' | 'loading' | 'success' | 'empty' | 'error'
}

export function SearchBox({ errorCode, items, onQueryChange, onSelect, query, status }: SearchBoxProps) {
  const { messages } = useWeatherLanguage()
  const inputId = useId()
  const listboxId = useId()
  const [activeIndex, setActiveIndex] = useState(0)
  const isExpanded = items.length > 0
  const activeCity = items[activeIndex]
  const activeOptionId = activeCity === undefined ? undefined : `${listboxId}-option-${activeCity.id}`

  useEffect(() => {
    setActiveIndex(0)
  }, [items])

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (items.length === 0) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((currentIndex) => (currentIndex + 1) % items.length)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((currentIndex) => (currentIndex - 1 + items.length) % items.length)
    }

    if (event.key === 'Enter' && activeCity !== undefined) {
      event.preventDefault()
      onSelect(activeCity)
    }
  }

  return (
    <div className="grid gap-3">
      <label className="text-sm font-semibold text-[#252523]" htmlFor={inputId}>
        {messages.search.label}
      </label>
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 size-5 text-[#5f5b54]" />
        <input
          aria-activedescendant={activeOptionId}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={isExpanded}
          aria-label={messages.search.heading}
          autoComplete="address-level2"
          className="min-h-11 w-full rounded-md border border-[#e6dfd8] bg-[#faf9f5] px-11 text-base text-[#141413] outline-none transition-colors placeholder:text-[#5f5b54] focus:border-[#a9583e] focus:ring-4 focus:ring-[#a9583e]/20"
          id={inputId}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={messages.search.placeholder}
          role="combobox"
          type="search"
          value={query}
        />
        {status === 'loading' && (
          <Loader2
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-3 size-5 animate-spin text-[#a9583e]"
          />
        )}
      </div>

      {status === 'loading' && (
        <p className="text-sm text-[#5f5b54]" role="status">
          {messages.search.loading}
        </p>
      )}
      {status === 'empty' && <p className="text-sm text-[#5f5b54]">{messages.search.empty}</p>}
      {status === 'error' && errorCode !== null && (
        <p className="text-sm text-[#c64545]" role="alert">
          {messages.search.error}
        </p>
      )}

      {isExpanded && (
        <ul
          aria-label={messages.search.resultsLabel}
          className="max-h-72 overflow-y-auto rounded-md border border-[#e6dfd8] bg-[#faf9f5] p-1 shadow-sm"
          id={listboxId}
          role="listbox"
        >
          {items.map((city, index) => (
            <li key={city.id}>
              <button
                aria-label={`${messages.search.selectCity} ${formatCityLabel(city)}`}
                aria-selected={index === activeIndex}
                className={`flex w-full cursor-pointer items-start gap-3 rounded-md px-3 py-3 text-left transition-colors focus:outline-none focus:ring-4 focus:ring-[#a9583e]/20 ${
                  index === activeIndex ? 'bg-[#efe9de]' : 'hover:bg-[#f5f0e8]'
                }`}
                id={`${listboxId}-option-${city.id}`}
                onClick={() => onSelect(city)}
                role="option"
                type="button"
              >
                <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#a9583e]" />
                <span>
                  <span className="block font-semibold text-[#141413]">{city.name}</span>
                  <span className="block text-sm text-[#5f5b54]">{formatCityRegion(city, messages.search.fallbackRegion)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function formatCityLabel(city: City): string {
  return [city.name, city.region, city.country].filter(Boolean).join(', ')
}

function formatCityRegion(city: City, fallbackRegion: string): string {
  return [city.region, city.country].filter(Boolean).join(', ') || fallbackRegion
}
