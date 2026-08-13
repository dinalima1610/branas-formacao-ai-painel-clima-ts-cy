import { useMemo, useState } from 'react';
import { fetchWeather, reversePlace, searchPlaces } from '../api/weather-api';
import { mapWeatherError, type FriendlyWeatherError } from '../lib/errors';
import { convertWeatherPayload, normalizeWeatherPayloadToCelsius } from '../lib/units';
import type { PlaceCandidate, TemperatureUnit, WeatherPanelPayload } from '../types';

type PanelStatus = 'idle' | 'searching' | 'selecting-place' | 'loading-weather' | 'ready' | 'error';
type RetryAction = (() => Promise<void>) | null;

const baselineTemperatureUnit: TemperatureUnit = 'celsius';

interface UseWeatherPanelState {
  candidates: PlaceCandidate[];
  error: FriendlyWeatherError | null;
  query: string;
  retry: RetryAction;
  selectedPlace: PlaceCandidate | null;
  status: PanelStatus;
  temperatureUnit: TemperatureUnit;
  weather: WeatherPanelPayload | null;
}

export interface UseWeatherPanelResult extends UseWeatherPanelState {
  clearError: () => void;
  requestGeolocation: () => Promise<void>;
  retryLastAction: () => Promise<void>;
  selectPlace: (place: PlaceCandidate) => Promise<void>;
  setQuery: (query: string) => void;
  submitSearch: () => Promise<void>;
  toggleTemperatureUnit: (temperatureUnit: TemperatureUnit) => void;
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('GEOLOCATION_UNAVAILABLE'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

export function useWeatherPanel(): UseWeatherPanelResult {
  const [state, setState] = useState<UseWeatherPanelState>({
    candidates: [],
    error: null,
    query: '',
    retry: null,
    selectedPlace: null,
    status: 'idle',
    temperatureUnit: 'celsius',
    weather: null,
  });

  const weather = useMemo(() => {
    if (!state.weather) {
      return null;
    }

    return convertWeatherPayload(state.weather, state.temperatureUnit);
  }, [state.weather, state.temperatureUnit]);

  const loadWeatherForPlace = async (place: PlaceCandidate) => {
    setState((current) => ({
      ...current,
      candidates: [],
      error: null,
      query: place.label,
      retry: null,
      selectedPlace: place,
      status: 'loading-weather',
    }));

    try {
      const payload = await fetchWeather(place.latitude, place.longitude, baselineTemperatureUnit);
      const normalizedPayload = normalizeWeatherPayloadToCelsius({
        ...payload,
        place,
      });

      setState((current) => ({
        ...current,
        candidates: [],
        error: null,
        query: place.label,
        retry: null,
        selectedPlace: place,
        status: 'ready',
        weather: normalizedPayload,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        error: mapWeatherError(error),
        retry: () => loadWeatherForPlace(place),
        status: 'error',
      }));
    }
  };

  const resolvePlaces = async (places: PlaceCandidate[]) => {
    const visiblePlaces = places.slice(0, 5);

    if (visiblePlaces.length === 1) {
      await loadWeatherForPlace(visiblePlaces[0]);
      return;
    }

    setState((current) => ({
      ...current,
      candidates: visiblePlaces,
      error: null,
      retry: null,
      selectedPlace: null,
      status: 'selecting-place',
    }));
  };

  const submitSearch = async () => {
    const trimmedQuery = state.query.trim();

    if (!trimmedQuery) {
      setState((current) => ({
        ...current,
        error: {
          title: 'Digite uma cidade',
          description: 'Informe pelo menos duas letras para buscar a previsão.',
          canRetry: false,
        },
        status: 'error',
      }));
      return;
    }

    setState((current) => ({
      ...current,
      candidates: [],
      error: null,
      retry: null,
      status: 'searching',
    }));

    try {
      const places = await searchPlaces(trimmedQuery);
      await resolvePlaces(places);
    } catch (error) {
      setState((current) => ({
        ...current,
        error: mapWeatherError(error),
        retry: () => submitSearch(),
        status: 'error',
      }));
    }
  };

  const requestGeolocation = async () => {
    setState((current) => ({
      ...current,
      candidates: [],
      error: null,
      retry: null,
      status: 'searching',
    }));

    try {
      const position = await getPosition();
      const places = await reversePlace(position.coords.latitude, position.coords.longitude);
      await resolvePlaces(places);
    } catch (error) {
      setState((current) => ({
        ...current,
        error: mapWeatherError(error),
        retry: null,
        status: 'error',
      }));
    }
  };

  const retryLastAction = async () => {
    if (state.retry) {
      await state.retry();
    }
  };

  return {
    ...state,
    clearError: () => setState((current) => ({ ...current, error: null, status: current.weather ? 'ready' : 'idle' })),
    requestGeolocation,
    retryLastAction,
    selectPlace: loadWeatherForPlace,
    setQuery: (query: string) => setState((current) => ({ ...current, query })),
    submitSearch,
    toggleTemperatureUnit: (temperatureUnit: TemperatureUnit) => setState((current) => ({ ...current, temperatureUnit })),
    weather,
  };
}
