import { describe, expect, it, vi } from 'vitest';

import { NominatimReverseGeocodingClient } from './nominatim-reverse-geocoding.client';

describe('NominatimReverseGeocodingClient', () => {
  it('maps reverse geocoding address into a location suggestion', async () => {
    const fetchClient = vi.fn().mockResolvedValue(
      createJsonResponse({
        address: {
          city: 'Curitiba',
          country: 'Brasil',
          country_code: 'br',
          state: 'Parana',
        },
      }),
    );
    const client = new NominatimReverseGeocodingClient({
      fetchClient,
      userAgent: 'test-agent',
    });

    const suggestion = await client.findNearestCity({ latitude: -25.43, longitude: -49.27 });

    expect(suggestion).toEqual({
      confidence: 'high',
      location: {
        admin1: 'Parana',
        country: 'Brasil',
        countryCode: 'BR',
        id: 'coordinates:-25.4300,-49.2700',
        latitude: -25.43,
        longitude: -49.27,
        name: 'Curitiba',
      },
      message: 'Cidade sugerida com base na localizacao autorizada pelo navegador.',
      source: 'openstreetmap',
    });
    expect(fetchClient).toHaveBeenCalledWith(
      expect.objectContaining({
        hostname: 'nominatim.openstreetmap.org',
      }),
      expect.objectContaining({
        headers: {
          'User-Agent': 'test-agent',
        },
      }),
    );
  });

  it('returns null when no city-like address component is available', async () => {
    const client = new NominatimReverseGeocodingClient({
      fetchClient: vi.fn().mockResolvedValue(
        createJsonResponse({
          address: {
            country: 'Brasil',
          },
        }),
      ),
    });

    await expect(client.findNearestCity({ latitude: -25.43, longitude: -49.27 })).resolves.toBeNull();
  });
});

function createJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
    },
    status,
  });
}
