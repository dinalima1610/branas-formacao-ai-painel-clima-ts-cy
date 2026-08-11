import { UpstreamWeatherError } from '../../errors/domain-errors';
import { OpenMeteoGeocodingPlace } from './open-meteo-geocoding.client';

const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';
const DEFAULT_USER_AGENT = 'branas-painel-clima-cy/1.0 educational weather panel';

interface NominatimReverseGeocodingClientOptions {
  fetchClient?: typeof fetch;
  reverseUrl?: string;
  timeoutMs?: number;
  userAgent?: string;
}

type JsonRecord = Record<string, unknown>;

export class NominatimReverseGeocodingClient {
  private readonly fetchClient?: typeof fetch;
  private readonly reverseUrl: string;
  private readonly timeoutMs: number;
  private readonly userAgent: string;

  constructor(options: NominatimReverseGeocodingClientOptions = {}) {
    this.fetchClient = options.fetchClient;
    this.reverseUrl = options.reverseUrl ?? DEFAULT_REVERSE_URL;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
  }

  async reverse(input: { latitude: number; longitude: number; count: number }): Promise<OpenMeteoGeocodingPlace[]> {
    const url = new URL(this.reverseUrl);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', String(input.latitude));
    url.searchParams.set('lon', String(input.longitude));
    url.searchParams.set('zoom', '10');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('accept-language', 'pt-BR');

    const payload = await this.fetchJson(url);
    const place = mapReversePayload(payload, input.latitude, input.longitude);

    return place === undefined ? [] : [place];
  }

  private async fetchJson(url: URL): Promise<JsonRecord> {
    try {
      const response = await this.getFetch()(url, {
        headers: {
          'User-Agent': this.userAgent
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      });

      if (!response.ok) {
        throw new UpstreamWeatherError('Nominatim reverse geocoding request failed');
      }

      const payload = await response.json() as unknown;

      if (!isRecord(payload)) {
        throw new UpstreamWeatherError('Nominatim reverse geocoding payload is invalid');
      }

      return payload;
    } catch (error) {
      if (error instanceof UpstreamWeatherError) {
        throw error;
      }

      throw new UpstreamWeatherError('Nominatim reverse geocoding request failed');
    }
  }

  private getFetch(): typeof fetch {
    return this.fetchClient ?? globalThis.fetch;
  }
}

const mapReversePayload = (
  payload: JsonRecord,
  latitude: number,
  longitude: number
): OpenMeteoGeocodingPlace | undefined => {
  const address = payload.address;

  if (!isRecord(address)) {
    return undefined;
  }

  const name = getFirstString(address, ['city', 'town', 'village', 'municipality', 'county']);

  if (name === undefined) {
    return undefined;
  }

  return {
    id: `coordinates-${latitude.toFixed(4)}-${longitude.toFixed(4)}`,
    name,
    latitude,
    longitude,
    country: getString(address.country) ?? 'Brasil',
    admin1: getFirstString(address, ['state', 'region'])
  };
};

const getFirstString = (record: JsonRecord, keys: string[]): string | undefined => {
  return keys.map((key) => getString(record[key])).find((value) => value !== undefined);
};

const isRecord = (value: unknown): value is JsonRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const getString = (value: unknown): string | undefined => {
  return typeof value === 'string' && value.trim().length > 0
    ? value
    : undefined;
};
