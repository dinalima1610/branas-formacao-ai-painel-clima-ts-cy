import { describe, expect, it, vi } from 'vitest';

import { OpenMeteoGeocodingPlace } from '../data/clients/open-meteo-geocoding.client';
import { PlaceNotFoundError, UpstreamWeatherError } from '../errors/domain-errors';
import { PlacesService, PlacesServiceClient } from './places.service';

const createPlace = (id: number): OpenMeteoGeocodingPlace => {
  return {
    id: String(id),
    name: `São Paulo ${id}`,
    latitude: -23.55 + id / 100,
    longitude: -46.63,
    country: 'Brasil',
    admin1: 'São Paulo'
  };
};

const createService = (places: OpenMeteoGeocodingPlace[]): {
  client: PlacesServiceClient;
  service: PlacesService;
} => {
  const client: PlacesServiceClient = {
    search: vi.fn(async () => places),
    reverse: vi.fn(async () => places)
  };

  return {
    client,
    service: new PlacesService(client)
  };
};

describe('PlacesService', () => {
  it('returns up to 5 place candidates with formatted labels', async () => {
    const { client, service } = createService([1, 2, 3, 4, 5, 6].map(createPlace));

    const places = await service.search('São Paulo');

    expect(places).toHaveLength(5);
    expect(places[0]).toMatchObject({
      id: '1',
      label: 'São Paulo 1, São Paulo, Brasil'
    });
    expect(client.search).toHaveBeenCalledWith({ query: 'São Paulo', count: 5 });
  });

  it('throws PlaceNotFoundError when search has no upstream matches', async () => {
    const { service } = createService([]);

    await expect(service.search('zzzznotaplace')).rejects.toBeInstanceOf(PlaceNotFoundError);
  });

  it('returns reverse geocoding candidates with the same shape as search', async () => {
    const { client, service } = createService([createPlace(3448439)]);

    const places = await service.reverse(-23.55, -46.63);

    expect(places[0]).toEqual({
      id: '3448439',
      name: 'São Paulo 3448439',
      admin1: 'São Paulo',
      country: 'Brasil',
      latitude: 34460.84,
      longitude: -46.63,
      label: 'São Paulo 3448439, São Paulo, Brasil'
    });
    expect(client.reverse).toHaveBeenCalledWith({
      latitude: -23.55,
      longitude: -46.63,
      count: 5
    });
  });

  it('returns a coordinate fallback when reverse geocoding is unavailable', async () => {
    const client: PlacesServiceClient = {
      search: vi.fn(async () => []),
      reverse: vi.fn(async () => {
        throw new UpstreamWeatherError('Open-Meteo reverse geocoding request failed');
      })
    };
    const service = new PlacesService(client);

    const places = await service.reverse(-25.42778, -49.27306);

    expect(places).toEqual([
      {
        id: 'coordinates--25.43--49.27',
        name: 'Local atual',
        country: 'Coordenadas informadas',
        latitude: -25.42778,
        longitude: -49.27306,
        label: 'Local atual (-25.43, -49.27)'
      }
    ]);
  });

  it('uses reverse fallback client before returning coordinates', async () => {
    const client: PlacesServiceClient = {
      search: vi.fn(async () => []),
      reverse: vi.fn(async () => {
        throw new UpstreamWeatherError('Open-Meteo reverse geocoding request failed');
      })
    };
    const fallbackClient: Pick<PlacesServiceClient, 'reverse'> = {
      reverse: vi.fn(async () => [
        {
          id: 'coordinates--25.4278--49.2731',
          name: 'Curitiba',
          latitude: -25.42778,
          longitude: -49.27306,
          country: 'Brasil',
          admin1: 'Parana'
        }
      ])
    };
    const service = new PlacesService(client, fallbackClient);

    const places = await service.reverse(-25.42778, -49.27306);

    expect(places).toEqual([
      {
        id: 'coordinates--25.4278--49.2731',
        name: 'Curitiba',
        admin1: 'Parana',
        country: 'Brasil',
        latitude: -25.42778,
        longitude: -49.27306,
        label: 'Curitiba, Parana, Brasil'
      }
    ]);
    expect(fallbackClient.reverse).toHaveBeenCalledWith({
      latitude: -25.42778,
      longitude: -49.27306,
      count: 5
    });
  });

  it('returns coordinate fallback when reverse fallback client has no matches', async () => {
    const client: PlacesServiceClient = {
      search: vi.fn(async () => []),
      reverse: vi.fn(async () => {
        throw new UpstreamWeatherError('Open-Meteo reverse geocoding request failed');
      })
    };
    const fallbackClient: Pick<PlacesServiceClient, 'reverse'> = {
      reverse: vi.fn(async () => [])
    };
    const service = new PlacesService(client, fallbackClient);

    const places = await service.reverse(-25.42778, -49.27306);

    expect(places[0]).toMatchObject({
      name: 'Local atual',
      label: 'Local atual (-25.43, -49.27)'
    });
  });

  it('returns coordinate fallback when reverse fallback client is unavailable', async () => {
    const client: PlacesServiceClient = {
      search: vi.fn(async () => []),
      reverse: vi.fn(async () => {
        throw new UpstreamWeatherError('Open-Meteo reverse geocoding request failed');
      })
    };
    const fallbackClient: Pick<PlacesServiceClient, 'reverse'> = {
      reverse: vi.fn(async () => {
        throw new UpstreamWeatherError('Nominatim reverse geocoding request failed');
      })
    };
    const service = new PlacesService(client, fallbackClient);

    const places = await service.reverse(-25.42778, -49.27306);

    expect(places[0]).toMatchObject({
      name: 'Local atual',
      label: 'Local atual (-25.43, -49.27)'
    });
  });
});
