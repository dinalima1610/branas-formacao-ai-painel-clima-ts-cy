import { UpstreamWeatherError } from '../../errors/domain-errors';

const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_SEARCH_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const DEFAULT_REVERSE_URL = 'https://geocoding-api.open-meteo.com/v1/reverse';
const OPEN_METEO_LANGUAGE = 'pt';
const OPEN_METEO_FORMAT = 'json';
const SLOW_UPSTREAM_WARNING_MS = 1_000;

export interface OpenMeteoGeocodingPlace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export interface GeocodingSearchInput {
  query: string;
  count: number;
}

export interface GeocodingReverseInput {
  latitude: number;
  longitude: number;
  count: number;
}

interface OpenMeteoGeocodingClientOptions {
  fetchClient?: typeof fetch;
  logger?: Pick<Console, 'warn' | 'error'>;
  reverseUrl?: string;
  searchUrl?: string;
  timeoutMs?: number;
}

export class OpenMeteoGeocodingClient {
  private readonly fetchClient?: typeof fetch;
  private readonly logger: Pick<Console, 'warn' | 'error'>;
  private readonly reverseUrl: string;
  private readonly searchUrl: string;
  private readonly timeoutMs: number;

  constructor(options: OpenMeteoGeocodingClientOptions = {}) {
    this.fetchClient = options.fetchClient;
    this.logger = options.logger ?? console;
    this.reverseUrl = options.reverseUrl ?? DEFAULT_REVERSE_URL;
    this.searchUrl = options.searchUrl ?? DEFAULT_SEARCH_URL;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async search(input: GeocodingSearchInput): Promise<OpenMeteoGeocodingPlace[]> {
    const url = this.buildSearchUrl(input);
    return this.fetchPlaces(url, 'open-meteo-geocoding-search');
  }

  async reverse(input: GeocodingReverseInput): Promise<OpenMeteoGeocodingPlace[]> {
    const url = this.buildReverseUrl(input);
    return this.fetchPlaces(url, 'open-meteo-geocoding-reverse');
  }

  private buildSearchUrl(input: GeocodingSearchInput): string {
    const url = new URL(this.searchUrl);
    url.searchParams.set('name', input.query);
    url.searchParams.set('count', String(input.count));
    url.searchParams.set('language', OPEN_METEO_LANGUAGE);
    url.searchParams.set('format', OPEN_METEO_FORMAT);
    return url.toString();
  }

  private buildReverseUrl(input: GeocodingReverseInput): string {
    const url = new URL(this.reverseUrl);
    url.searchParams.set('latitude', String(input.latitude));
    url.searchParams.set('longitude', String(input.longitude));
    url.searchParams.set('count', String(input.count));
    url.searchParams.set('language', OPEN_METEO_LANGUAGE);
    url.searchParams.set('format', OPEN_METEO_FORMAT);
    return url.toString();
  }

  private async fetchPlaces(
    url: string,
    endpoint: string
  ): Promise<OpenMeteoGeocodingPlace[]> {
    const startedAt = Date.now();

    try {
      const response = await this.getFetch()(url, {
        signal: AbortSignal.timeout(this.timeoutMs)
      });
      const durationMs = Date.now() - startedAt;

      if (!response.ok) {
        this.logger.warn({ endpoint, status: response.status, durationMs });
        throw new UpstreamWeatherError('Open-Meteo geocoding request failed');
      }

      if (durationMs > SLOW_UPSTREAM_WARNING_MS) {
        this.logger.warn({ endpoint, status: response.status, durationMs });
      }

      const payload = await response.json() as unknown;
      return mapGeocodingPayload(payload);
    } catch (error) {
      if (error instanceof UpstreamWeatherError) {
        throw error;
      }

      const durationMs = Date.now() - startedAt;
      this.logger.error({ endpoint, status: 'network_error', durationMs });
      throw new UpstreamWeatherError('Open-Meteo geocoding request failed');
    }
  }

  private getFetch(): typeof fetch {
    return this.fetchClient ?? globalThis.fetch;
  }
}

const mapGeocodingPayload = (payload: unknown): OpenMeteoGeocodingPlace[] => {
  if (!isRecord(payload)) {
    throw new UpstreamWeatherError('Open-Meteo geocoding payload is invalid');
  }

  const results = payload.results;
  if (results === undefined) {
    return [];
  }

  if (!Array.isArray(results)) {
    throw new UpstreamWeatherError('Open-Meteo geocoding results are invalid');
  }

  return results
    .map(mapGeocodingPlace)
    .filter((place): place is OpenMeteoGeocodingPlace => place !== undefined);
};

const mapGeocodingPlace = (value: unknown): OpenMeteoGeocodingPlace | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const name = getString(value.name);
  const latitude = getNumber(value.latitude);
  const longitude = getNumber(value.longitude);
  const country = getString(value.country);

  if (!name || latitude === undefined || longitude === undefined || !country) {
    return undefined;
  }

  return {
    id: getStablePlaceId(value, name, latitude, longitude),
    name,
    latitude,
    longitude,
    country,
    admin1: getString(value.admin1)
  };
};

const getStablePlaceId = (
  value: Record<string, unknown>,
  name: string,
  latitude: number,
  longitude: number
): string => {
  const upstreamId = getNumber(value.id) ?? getString(value.id);

  if (upstreamId !== undefined) {
    return String(upstreamId);
  }

  return `${name}-${latitude}-${longitude}`;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const getString = (value: unknown): string | undefined => {
  return typeof value === 'string' && value.trim().length > 0
    ? value
    : undefined;
};

const getNumber = (value: unknown): number | undefined => {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
};
