import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi, type MockedFunction } from 'vitest';
import App from './App';
import type { PlaceCandidate, WeatherPanelPayload } from './features/weather-panel';

const curitiba: PlaceCandidate = {
  admin1: 'Paraná',
  country: 'Brazil',
  id: 'curitiba-br',
  label: 'Curitiba, Paraná, Brazil',
  latitude: -25.42,
  longitude: -49.27,
  name: 'Curitiba',
};

const springfieldIllinois: PlaceCandidate = {
  admin1: 'Illinois',
  country: 'United States',
  id: 'springfield-il',
  label: 'Springfield, Illinois, United States',
  latitude: 39.78,
  longitude: -89.64,
  name: 'Springfield',
};

const springfieldMissouri: PlaceCandidate = {
  admin1: 'Missouri',
  country: 'United States',
  id: 'springfield-mo',
  label: 'Springfield, Missouri, United States',
  latitude: 37.21,
  longitude: -93.29,
  name: 'Springfield',
};

const allPlaces = [curitiba, springfieldIllinois, springfieldMissouri];

const createWeather = (place: PlaceCandidate = curitiba): WeatherPanelPayload => ({
  current: {
    apparentTemperature: 21,
    conditionIconKey: 'sunny',
    conditionLabel: 'Céu limpo',
    humidity: 62,
    isDay: true,
    temperature: 20,
    weatherCode: 0,
    windSpeed: 10,
    windSpeedUnit: 'kmh',
  },
  daily: [
    {
      conditionIconKey: 'sunny',
      conditionLabel: 'Céu limpo',
      date: '2026-05-21',
      temperatureMax: 25,
      temperatureMin: 15,
      weatherCode: 0,
    },
    {
      conditionIconKey: 'cloudy',
      conditionLabel: 'Nublado',
      date: '2026-05-22',
      temperatureMax: 24,
      temperatureMin: 16,
      weatherCode: 3,
    },
    {
      conditionIconKey: 'rain',
      conditionLabel: 'Chuva',
      date: '2026-05-23',
      temperatureMax: 22,
      temperatureMin: 14,
      weatherCode: 61,
    },
  ],
  hourly: Array.from({ length: 24 }, (_, index) => ({
    conditionIconKey: index % 2 === 0 ? 'sunny' : 'cloudy',
    conditionLabel: index % 2 === 0 ? 'Céu limpo' : 'Nublado',
    temperature: index === 0 ? 10 : 11,
    time: new Date(Date.UTC(2026, 4, 21, index)).toISOString(),
    weatherCode: index % 2 === 0 ? 0 : 3,
  })),
  meta: {
    fetchedAt: '2026-05-21T12:00:00.000Z',
    temperatureUnit: 'celsius',
  },
  place,
});

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });

interface FetchMockOptions {
  healthFails?: boolean;
}

type FetchInput = Parameters<typeof globalThis.fetch>[0];

const getRequestUrl = (input: FetchInput | URL): URL => {
  if (typeof Request !== 'undefined' && input instanceof Request) {
    return new URL(input.url);
  }

  return new URL(input.toString());
};

const findPlaceByCoordinates = (latitude: number, longitude: number): PlaceCandidate =>
  allPlaces.find((place) => place.latitude === latitude && place.longitude === longitude) ?? curitiba;

const installFetchMock = ({ healthFails = false }: FetchMockOptions = {}) => {
  const fetchMock = vi.fn(async (input: FetchInput | URL) => {
    const url = getRequestUrl(input);

    if (url.pathname === '/health') {
      if (healthFails) {
        throw new Error('Backend unavailable');
      }

      return jsonResponse({ status: 'ok' });
    }

    if (url.pathname === '/places/search') {
      const query = url.searchParams.get('q');
      const places = query === 'Springfield' ? [springfieldIllinois, springfieldMissouri] : [curitiba];

      return jsonResponse({ places });
    }

    if (url.pathname === '/weather') {
      const latitude = Number(url.searchParams.get('latitude'));
      const longitude = Number(url.searchParams.get('longitude'));
      const place = findPlaceByCoordinates(latitude, longitude);

      return jsonResponse(createWeather(place));
    }

    throw new Error(`Unhandled request: ${url.toString()}`);
  }) as MockedFunction<typeof fetch>;

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
};

const searchFor = async (city: string) => {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText('Buscar cidade'), city);
  await user.click(screen.getByRole('button', { name: /^buscar$/i }));

  return user;
};

describe('App integration', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('renders WeatherPanel empty-state hint on initial load and preserves the API health pill', async () => {
    installFetchMock();

    render(<App />);

    expect(screen.getByText('Busque uma cidade para ver o clima.')).toBeInTheDocument();
    expect(screen.getByText('API Status')).toBeInTheDocument();
    expect(await screen.findByRole('status', { name: 'API Status: online' })).toBeInTheDocument();
  });

  it('uses the configured API base URL for health polling and weather requests', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');
    const fetchMock = installFetchMock();

    render(<App />);
    await searchFor('Curitiba');
    expect((await screen.findAllByText('20°C')).length).toBeGreaterThan(0);

    const requestedUrls = fetchMock.mock.calls.map(([input]) => getRequestUrl(input).toString());

    expect(requestedUrls).toContain('https://api.example.test/health');
    expect(requestedUrls.some((url) => url.startsWith('https://api.example.test/places/search?'))).toBe(true);
    expect(requestedUrls.some((url) => url.startsWith('https://api.example.test/weather?'))).toBe(true);
  });

  it('shows the green health indicator when /health returns 200', async () => {
    installFetchMock();

    render(<App />);

    await waitFor(() => expect(screen.getByTestId('api-status-indicator')).toHaveClass('bg-success'));
    expect(screen.getByRole('status', { name: 'API Status: online' })).toBeInTheDocument();
  });

  it('shows the red health indicator when /health fetch fails', async () => {
    installFetchMock({ healthFails: true });

    render(<App />);

    await waitFor(() => expect(screen.getByTestId('api-status-indicator')).toHaveClass('bg-error'));
    expect(screen.getByRole('status', { name: 'API Status: offline' })).toBeInTheDocument();
  });

  it('completes a successful city search and renders current, hourly, and daily weather sections', async () => {
    installFetchMock();

    render(<App />);
    await searchFor('Curitiba');

    expect((await screen.findAllByText('20°C')).length).toBeGreaterThan(0);
    expect(screen.getByText('Curitiba, Paraná, Brazil')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Próximas 24 horas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Próximos dias' })).toBeInTheDocument();
  });

  it('shows disambiguation for an ambiguous city and loads weather after selection', async () => {
    installFetchMock();

    render(<App />);
    const user = await searchFor('Springfield');

    expect(await screen.findByRole('heading', { name: 'Escolha o lugar correto' })).toBeInTheDocument();
    expect(screen.getByText('Springfield, Illinois, United States')).toBeInTheDocument();
    expect(screen.getByText('Springfield, Missouri, United States')).toBeInTheDocument();

    await user.click(screen.getByText('Springfield, Illinois, United States'));

    expect(await screen.findByText('Springfield, Illinois, United States')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Próximas 24 horas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Próximos dias' })).toBeInTheDocument();
  });
});
