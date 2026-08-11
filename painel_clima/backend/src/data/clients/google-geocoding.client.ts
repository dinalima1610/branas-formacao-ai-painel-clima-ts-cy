import {
  type CoordinatesInput,
  type FetchClient,
  type LocationSuggestion,
  WeatherError,
} from '../../types/weather';
import { createCoordinateLocationId } from '../../services/weather-validation';

const DEFAULT_TIMEOUT_MS = 5_000;
const GOOGLE_GEOCODING_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

interface GoogleGeocodingClientOptions {
  apiKey?: string;
  fetchClient?: FetchClient;
  timeoutMs?: number;
}

type JsonRecord = Record<string, unknown>;

export class GoogleGeocodingClient {
  private readonly apiKey?: string;
  private readonly fetchClient: FetchClient;
  private readonly timeoutMs: number;

  constructor(options: GoogleGeocodingClientOptions = {}) {
    this.apiKey = options.apiKey;
    this.fetchClient = options.fetchClient ?? fetch;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async findNearestCity(input: CoordinatesInput): Promise<LocationSuggestion | null> {
    if (this.apiKey === undefined || this.apiKey.trim().length === 0) {
      return null;
    }

    const url = new URL(GOOGLE_GEOCODING_BASE_URL);
    url.searchParams.set('latlng', `${input.latitude},${input.longitude}`);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('language', 'pt-BR');
    url.searchParams.set('result_type', 'locality|administrative_area_level_2');

    const payload = await this.fetchJson(url);

    if (payload.status !== 'OK') {
      return null;
    }

    const results = payload.results;

    if (!Array.isArray(results)) {
      return null;
    }

    const firstUsefulResult = results.filter(isRecord).find((result) => {
      const components = result.address_components;
      return Array.isArray(components) && components.some(hasCityType);
    });

    if (firstUsefulResult === undefined) {
      return null;
    }

    return this.mapSuggestion(firstUsefulResult, input);
  }

  private async fetchJson(url: URL): Promise<JsonRecord> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchClient(url, { signal: controller.signal });

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

  private mapSuggestion(result: JsonRecord, input: CoordinatesInput): LocationSuggestion | null {
    const components = result.address_components;

    if (!Array.isArray(components)) {
      return null;
    }

    const records = components.filter(isRecord);
    const city = findComponent(records, ['locality', 'administrative_area_level_2']);

    if (city === undefined) {
      return null;
    }

    const admin1 = findComponent(records, ['administrative_area_level_1']);
    const country = findComponent(records, ['country']);

    return {
      location: {
        id: createCoordinateLocationId(input),
        name: city.longName,
        admin1: admin1?.longName,
        country: country?.longName,
        countryCode: country?.shortName,
        latitude: input.latitude,
        longitude: input.longitude,
      },
      source: 'google-geocoding',
      confidence: 'high',
      message: 'Cidade sugerida com base na localizacao autorizada pelo navegador.',
    };
  }

  private createUnavailableError(): WeatherError {
    return new WeatherError({
      code: 'WEATHER_PROVIDER_UNAVAILABLE',
      message: 'Nao foi possivel consultar o reverse geocoding.',
      statusCode: 502,
    });
  }
}

interface AddressComponent {
  longName: string;
  shortName?: string;
  types: string[];
}

function findComponent(records: JsonRecord[], acceptedTypes: string[]): AddressComponent | undefined {
  return records
    .map(mapAddressComponent)
    .find((component) => component !== undefined
      && acceptedTypes.some((type) => component.types.includes(type)));
}

function mapAddressComponent(record: JsonRecord): AddressComponent | undefined {
  const longName = getOptionalString(record, 'long_name');
  const types = record.types;

  if (longName === undefined || !Array.isArray(types) || !types.every((type) => typeof type === 'string')) {
    return undefined;
  }

  return {
    longName,
    shortName: getOptionalString(record, 'short_name'),
    types,
  };
}

function hasCityType(component: unknown): boolean {
  if (!isRecord(component)) {
    return false;
  }

  const types = component.types;

  if (!Array.isArray(types)) {
    return false;
  }

  return types.includes('locality') || types.includes('administrative_area_level_2');
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getOptionalString(record: JsonRecord, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}
