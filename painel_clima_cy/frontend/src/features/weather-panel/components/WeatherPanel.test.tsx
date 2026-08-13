import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi, type MockedFunction } from 'vitest';
import type { PlaceCandidate, WeatherPanelPayload } from '../types';
import { WeatherPanel } from './WeatherPanel';

const saoPaulo: PlaceCandidate = {
  id: 'sao-paulo-br',
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brazil',
  latitude: -23.55,
  longitude: -46.63,
  label: 'São Paulo, São Paulo, Brazil',
};

const saoPauloUs: PlaceCandidate = {
  id: 'sao-paulo-us',
  name: 'São Paulo',
  admin1: 'California',
  country: 'United States',
  latitude: 37.2,
  longitude: -121.9,
  label: 'São Paulo, California, United States',
};

const createWeather = (place: PlaceCandidate = saoPaulo): WeatherPanelPayload => ({
  place,
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
});

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });

const setupFetch = () => {
  const fetchMock = vi.fn() as MockedFunction<typeof fetch>;
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const setupGeolocation = (getCurrentPosition: Geolocation['getCurrentPosition']) => {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: { getCurrentPosition },
  });
};

const searchFor = async (city: string) => {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText('Buscar cidade'), city);
  await user.click(screen.getByRole('button', { name: /buscar/i }));

  return user;
};

describe('WeatherPanel', () => {
  let fetchMock: MockedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock = setupFetch();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders the empty-state hint before the first search', () => {
    render(<WeatherPanel />);

    expect(screen.getByText('Busque uma cidade para ver o clima.')).toBeInTheDocument();
  });

  it('submits a search with multiple candidates and renders disambiguation labels', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ places: [saoPaulo, saoPauloUs] }));
    render(<WeatherPanel />);

    await searchFor('São Paulo');

    expect(await screen.findByText('São Paulo, São Paulo, Brazil')).toBeInTheDocument();
    expect(screen.getByText('São Paulo, California, United States')).toBeInTheDocument();
  });

  it('selects a candidate, fetches weather, and renders current temperature', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ places: [saoPaulo, saoPauloUs] }))
      .mockResolvedValueOnce(jsonResponse(createWeather()));
    render(<WeatherPanel />);

    const user = await searchFor('São Paulo');
    await user.click(await screen.findByText('São Paulo, São Paulo, Brazil'));

    expect(screen.getByLabelText('Buscar cidade')).toHaveValue('São Paulo, São Paulo, Brazil');
    expect((await screen.findAllByText('20°C')).length).toBeGreaterThan(0);
    expect(fetchMock.mock.calls[1][0].toString()).toContain('/weather?');
  });

  it('shows loading feedback while a search request is in flight', async () => {
    let resolveSearch: (response: Response) => void = () => undefined;
    const searchPromise = new Promise<Response>((resolve) => {
      resolveSearch = resolve;
    });
    fetchMock.mockReturnValueOnce(searchPromise);
    render(<WeatherPanel />);

    await searchFor('Curitiba');

    expect(screen.getByText('Buscando lugares próximos...')).toBeInTheDocument();
    resolveSearch(jsonResponse({ places: [saoPaulo, saoPauloUs] }));
    expect(await screen.findByText('São Paulo, São Paulo, Brazil')).toBeInTheDocument();
  });

  it('displays a PT-BR no-results message for PLACE_NOT_FOUND', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ code: 'PLACE_NOT_FOUND', message: 'No place found' }, 404));
    render(<WeatherPanel />);

    await searchFor('Atlantis');

    expect(await screen.findByText('Não encontramos esse lugar')).toBeInTheDocument();
    expect(screen.getByText('Tente buscar por uma cidade maior ou inclua estado e país.')).toBeInTheDocument();
  });

  it('displays an upstream error with retry and re-invokes the failed request', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ code: 'UPSTREAM_WEATHER_ERROR', message: 'Upstream failed' }, 502))
      .mockResolvedValueOnce(jsonResponse({ places: [saoPaulo] }))
      .mockResolvedValueOnce(jsonResponse(createWeather()));
    render(<WeatherPanel />);

    const user = await searchFor('São Paulo');
    expect(await screen.findByText('Previsão temporariamente indisponível')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /tentar novamente/i }));

    expect((await screen.findAllByText('20°C')).length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('does not call navigator.geolocation on initial render', () => {
    const getCurrentPosition = vi.fn();
    setupGeolocation(getCurrentPosition);

    render(<WeatherPanel />);

    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it('clicking geolocation calls reverse place lookup and then weather flow', async () => {
    const getCurrentPosition: Geolocation['getCurrentPosition'] = (success) => {
      success({
        coords: {
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          latitude: -23.55,
          longitude: -46.63,
          speed: null,
          toJSON: () => ({}),
        },
        timestamp: Date.now(),
        toJSON: () => ({}),
      });
    };
    setupGeolocation(getCurrentPosition);
    fetchMock.mockResolvedValueOnce(jsonResponse({ places: [saoPaulo] })).mockResolvedValueOnce(jsonResponse(createWeather()));
    render(<WeatherPanel />);

    await userEvent.click(screen.getByRole('button', { name: /usar minha localização/i }));

    await waitFor(() => expect(fetchMock.mock.calls[0][0].toString()).toContain('/places/reverse?'));
    expect(screen.getByLabelText('Buscar cidade')).toHaveValue(saoPaulo.label);
    expect(await screen.findByText(saoPaulo.label)).toBeInTheDocument();
    expect((await screen.findAllByText('20°C')).length).toBeGreaterThan(0);
  });

  it('replaces a previous search query with the resolved geolocation label', async () => {
    const getCurrentPosition: Geolocation['getCurrentPosition'] = (success) => {
      success({
        coords: {
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          latitude: -23.55,
          longitude: -46.63,
          speed: null,
          toJSON: () => ({}),
        },
        timestamp: Date.now(),
        toJSON: () => ({}),
      });
    };
    setupGeolocation(getCurrentPosition);
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ places: [saoPauloUs] }))
      .mockResolvedValueOnce(jsonResponse(createWeather(saoPauloUs)))
      .mockResolvedValueOnce(jsonResponse({ places: [saoPaulo] }))
      .mockResolvedValueOnce(jsonResponse(createWeather(saoPaulo)));
    render(<WeatherPanel />);

    await searchFor('São Paulo');
    await screen.findByText(saoPauloUs.label);
    await userEvent.click(screen.getByRole('button', { name: /usar minha localização/i }));

    expect(await screen.findByText(saoPaulo.label)).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar cidade')).toHaveValue(saoPaulo.label);
  });

  it('shows a neutral denied-location message and keeps manual search usable', async () => {
    const getCurrentPosition: Geolocation['getCurrentPosition'] = (_success, error) => {
      error?.({ code: 1, message: 'denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 });
    };
    setupGeolocation(getCurrentPosition);
    render(<WeatherPanel />);

    await userEvent.click(screen.getByRole('button', { name: /usar minha localização/i }));

    expect(await screen.findByText('Localização não autorizada')).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar cidade')).toBeEnabled();
    expect(screen.getByLabelText('Buscar cidade')).toHaveValue('');
  });

  it('toggles Celsius to Fahrenheit across current, hourly, and daily values without refetching weather', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ places: [saoPaulo] })).mockResolvedValueOnce(jsonResponse(createWeather()));
    render(<WeatherPanel />);

    const user = await searchFor('São Paulo');
    expect((await screen.findAllByText('20°C')).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect((await screen.findAllByText('68°F')).length).toBeGreaterThan(0);
    expect(screen.getByText('50°F')).toBeInTheDocument();
    expect(screen.getByText('77°F / 59°F')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
