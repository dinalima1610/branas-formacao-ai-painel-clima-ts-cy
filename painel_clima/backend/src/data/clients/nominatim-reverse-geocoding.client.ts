import {
  type CoordinatesInput,
  type FetchClient,
  type LocationSuggestion,
  WeatherError,
} from '../../types/weather';
import { createCoordinateLocationId } from '../../services/weather-validation';

const DEFAULT_TIMEOUT_MS = 5_000;
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

interface NominatimReverseGeocodingClientOptions {
  fetchClient?: FetchClient;
  timeoutMs?: number;
  userAgent?: string;
}

type JsonRecord = Record<string, unknown>;

export class NominatimReverseGeocodingClient {
  private readonly fetchClient: FetchClient;
  private readonly timeoutMs: number;
  private readonly userAgent: string;

  constructor(options: NominatimReverseGeocodingClientOptions = {}) {
    this.fetchClient = options.fetchClient ?? fetch;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.userAgent = options.userAgent ?? 'branas-painel-clima/1.0 educational weather panel';
  }

  async findNearestCity(input: CoordinatesInput): Promise<LocationSuggestion | null> {
    const url = new URL(NOMINATIM_REVERSE_URL);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', String(input.latitude));
    url.searchParams.set('lon', String(input.longitude));
    url.searchParams.set('zoom', '10');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('accept-language', 'pt-BR');

    const payload = await this.fetchJson(url);
    return mapSuggestion(payload, input);
  }

  private async fetchJson(url: URL): Promise<JsonRecord> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchClient(url, {
        headers: {
          'User-Agent': this.userAgent,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw this.createUnavailableError();
      }

      const payload: unknown = await response.json();

      if (!isRecord(payload)) {
        throw this.createUnavailableError();
      }

      return payload;
    } catch (error) {
      if (error instanceof WeatherError) {
        throw error;
      }

      throw this.createUnavailableError();
    } finally {
      clearTimeout(timeout);
    }
  }

  private createUnavailableError(): WeatherError {
    return new WeatherError({
      code: 'WEATHER_PROVIDER_UNAVAILABLE',
      message: 'Nao foi possivel consultar o reverse geocoding.',
      statusCode: 502,
    });
  }
}

function mapSuggestion(payload: JsonRecord, input: CoordinatesInput): LocationSuggestion | null {
  const address = payload.address;

  if (!isRecord(address)) {
    return null;
  }

  const city = getFirstString(address, ['city', 'town', 'village', 'municipality', 'county']);

  if (city === undefined) {
    return null;
  }

  const admin1 = getFirstString(address, ['state', 'region']);
  const country = getOptionalString(address, 'country');
  const countryCode = getOptionalString(address, 'country_code')?.toUpperCase();

  return {
    location: {
      id: createCoordinateLocationId(input),
      name: city,
      admin1,
      country,
      countryCode,
      latitude: input.latitude,
      longitude: input.longitude,
    },
    source: 'openstreetmap',
    confidence: 'high',
    message: 'Cidade sugerida com base na localizacao autorizada pelo navegador.',
  };
}

function getFirstString(record: JsonRecord, keys: string[]): string | undefined {
  return keys.map((key) => getOptionalString(record, key)).find((value) => value !== undefined);
}

function getOptionalString(record: JsonRecord, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
