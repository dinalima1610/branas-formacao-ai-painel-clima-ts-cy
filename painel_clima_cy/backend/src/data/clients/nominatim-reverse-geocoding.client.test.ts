import { describe, expect, it, vi } from 'vitest';

import { NominatimReverseGeocodingClient } from './nominatim-reverse-geocoding.client';

describe('NominatimReverseGeocodingClient', () => {
  it('maps reverse geocoding address to a place candidate', async () => {
    const fetchClient = vi.fn(async () =>
      new Response(
        JSON.stringify({
          address: {
            city: 'Curitiba',
            state: 'Parana',
            country: 'Brasil',
            country_code: 'br'
          }
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        }
      )
    );
    const client = new NominatimReverseGeocodingClient({ fetchClient });

    const places = await client.reverse({ latitude: -25.42778, longitude: -49.27306, count: 5 });

    expect(places).toEqual([
      {
        id: 'coordinates--25.4278--49.2731',
        name: 'Curitiba',
        latitude: -25.42778,
        longitude: -49.27306,
        country: 'Brasil',
        admin1: 'Parana'
      }
    ]);
    expect(fetchClient).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({
      headers: {
        'User-Agent': 'branas-painel-clima-cy/1.0 educational weather panel'
      }
    }));
  });

  it('returns no places when address has no displayable city', async () => {
    const fetchClient = vi.fn(async () =>
      new Response(
        JSON.stringify({
          address: {
            state: 'Parana',
            country: 'Brasil'
          }
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        }
      )
    );
    const client = new NominatimReverseGeocodingClient({ fetchClient });

    await expect(client.reverse({ latitude: -25.42778, longitude: -49.27306, count: 5 })).resolves.toEqual([]);
  });

  it('throws an upstream error when Nominatim returns a non-ok response', async () => {
    const fetchClient = vi.fn(async () => new Response(null, { status: 503 }));
    const client = new NominatimReverseGeocodingClient({ fetchClient });

    await expect(client.reverse({ latitude: -25.42778, longitude: -49.27306, count: 5 })).rejects.toThrow(
      'Nominatim reverse geocoding request failed'
    );
  });
});
