import { describe, expect, it, vi } from 'vitest';

import { GoogleGeocodingClient } from './google-geocoding.client';
import { type FetchClient } from '../../types/weather';

describe('GoogleGeocodingClient', () => {
  it('does not call Google when the API key is missing', async () => {
    const fetchClient: FetchClient = vi.fn(async () => new Response('{}'));
    const client = new GoogleGeocodingClient({ fetchClient });

    const suggestion = await client.findNearestCity({ latitude: -23.55, longitude: -46.63 });

    expect(suggestion).toBeNull();
    expect(fetchClient).not.toHaveBeenCalled();
  });

  it('maps a reverse geocoding result into a location suggestion', async () => {
    const client = new GoogleGeocodingClient({
      apiKey: 'test-key',
      fetchClient: createFetchClient({
        status: 'OK',
        results: [
          {
            address_components: [
              {
                long_name: 'Sao Paulo',
                short_name: 'Sao Paulo',
                types: ['locality', 'political'],
              },
              {
                long_name: 'Sao Paulo',
                short_name: 'SP',
                types: ['administrative_area_level_1', 'political'],
              },
              {
                long_name: 'Brasil',
                short_name: 'BR',
                types: ['country', 'political'],
              },
            ],
          },
        ],
      }),
    });

    const suggestion = await client.findNearestCity({ latitude: -23.55, longitude: -46.63 });

    expect(suggestion).toMatchObject({
      confidence: 'high',
      source: 'google-geocoding',
      location: {
        id: 'coordinates:-23.5500,-46.6300',
        name: 'Sao Paulo',
        admin1: 'Sao Paulo',
        country: 'Brasil',
        countryCode: 'BR',
      },
    });
  });

  it('returns null when Google has no useful result', async () => {
    const client = new GoogleGeocodingClient({
      apiKey: 'test-key',
      fetchClient: createFetchClient({ status: 'ZERO_RESULTS', results: [] }),
    });

    await expect(client.findNearestCity({ latitude: -23.55, longitude: -46.63 })).resolves.toBeNull();
  });
});

function createFetchClient(payload: unknown): FetchClient {
  return vi.fn(async () => new Response(JSON.stringify(payload), {
    headers: { 'content-type': 'application/json' },
    status: 200,
  }));
}
