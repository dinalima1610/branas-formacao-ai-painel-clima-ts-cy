import { afterEach, beforeEach, describe, expect, it, vi, type MockedFunction } from 'vitest';
import { fetchWeather, reversePlace, searchPlaces, WeatherApiError } from './weather-api';
import type { PlaceCandidate, WeatherPanelPayload } from '../types';

const place: PlaceCandidate = {
  id: 'sao-paulo-br',
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brazil',
  latitude: -23.55,
  longitude: -46.63,
  label: 'São Paulo, São Paulo, Brazil',
};

const weather: WeatherPanelPayload = {
  place,
  current: {
    apparentTemperature: 21,
    conditionIconKey: 'sunny',
    conditionLabel: 'Céu limpo',
    humidity: 60,
    isDay: true,
    temperature: 20,
    weatherCode: 0,
    windSpeed: 10,
    windSpeedUnit: 'kmh',
  },
  daily: [],
  hourly: [],
  meta: {
    fetchedAt: '2026-05-21T12:00:00.000Z',
    temperatureUnit: 'celsius',
  },
};

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });

describe('weather-api', () => {
  let fetchMock: MockedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock = vi.fn() as MockedFunction<typeof fetch>;
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls GET /places/search with an encoded query and returns candidates', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ places: [place] }));

    const result = await searchPlaces('São Paulo');
    const [requestUrl] = fetchMock.mock.calls[0];
    const url = new URL(requestUrl.toString());

    expect(url.toString()).toBe('http://localhost:3000/places/search?q=S%C3%A3o+Paulo');
    expect(result).toEqual([place]);
  });

  it('calls GET /places/reverse with latitude and longitude query params', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ places: [place] }));

    const result = await reversePlace(-23.55, -46.63);
    const [requestUrl] = fetchMock.mock.calls[0];
    const url = new URL(requestUrl.toString());

    expect(url.pathname).toBe('/places/reverse');
    expect(url.searchParams.get('latitude')).toBe('-23.55');
    expect(url.searchParams.get('longitude')).toBe('-46.63');
    expect(result).toEqual([place]);
  });

  it('calls GET /weather with latitude, longitude, and temperatureUnit', async () => {
    fetchMock.mockResolvedValue(jsonResponse(weather));

    const result = await fetchWeather(-23.55, -46.63, 'celsius');
    const [requestUrl] = fetchMock.mock.calls[0];
    const url = new URL(requestUrl.toString());

    expect(url.pathname).toBe('/weather');
    expect(url.searchParams.get('latitude')).toBe('-23.55');
    expect(url.searchParams.get('longitude')).toBe('-46.63');
    expect(url.searchParams.get('temperatureUnit')).toBe('celsius');
    expect(result).toEqual(weather);
  });

  it('maps 404 PLACE_NOT_FOUND responses to typed API errors', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: 'PLACE_NOT_FOUND', message: 'No place found' }, 404));

    try {
      await searchPlaces('Atlantis');
      throw new Error('Expected searchPlaces to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(WeatherApiError);
      expect(error).toMatchObject({
        code: 'PLACE_NOT_FOUND',
        status: 404,
      });
    }
  });
});
