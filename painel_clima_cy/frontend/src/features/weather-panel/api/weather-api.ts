import type {
  PlaceCandidate,
  TemperatureUnit,
  WeatherApiErrorBody,
  WeatherApiErrorCode,
  WeatherPanelPayload,
} from '../types';
import { buildApiUrl } from '@/lib/api-config';

interface PlacesResponse {
  places: PlaceCandidate[];
}

export class WeatherApiError extends Error {
  readonly code: WeatherApiErrorCode;
  readonly status: number;

  constructor({ code, message }: WeatherApiErrorBody, status: number) {
    super(message);
    this.name = 'WeatherApiError';
    this.code = code;
    this.status = status;
  }
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const payload = await readResponseBody(response);

  if (!response.ok) {
    const errorBody = payload as Partial<WeatherApiErrorBody>;
    throw new WeatherApiError(
      {
        code: errorBody.code ?? 'UNKNOWN_ERROR',
        message: errorBody.message ?? 'Unexpected weather API error',
      },
      response.status,
    );
  }

  return payload as T;
}

async function readResponseBody(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return {};
  }
}

export async function searchPlaces(query: string): Promise<PlaceCandidate[]> {
  const url = buildApiUrl('/places/search', { q: query });
  const response = await fetch(url);
  const payload = await readJsonResponse<PlacesResponse>(response);

  return payload.places;
}

export async function reversePlace(latitude: number, longitude: number): Promise<PlaceCandidate[]> {
  const url = buildApiUrl('/places/reverse', {
    latitude: latitude.toString(),
    longitude: longitude.toString(),
  });
  const response = await fetch(url);
  const payload = await readJsonResponse<PlacesResponse>(response);

  return payload.places;
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
  temperatureUnit: TemperatureUnit,
): Promise<WeatherPanelPayload> {
  const url = buildApiUrl('/weather', {
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    temperatureUnit,
  });
  const response = await fetch(url);

  return readJsonResponse<WeatherPanelPayload>(response);
}
