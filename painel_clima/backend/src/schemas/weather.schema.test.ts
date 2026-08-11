import { describe, expect, it } from 'vitest';

import { citySearchQuerySchema, weatherQuerySchema } from './weather.schema';

describe('weather query schemas', () => {
  it('normalizes v1 city search query parameters', () => {
    const query = citySearchQuerySchema.parse({
      language: 'pt',
      limit: '7',
      q: 'Curitiba',
    });

    expect(query).toEqual({
      language: 'pt',
      limit: 7,
      query: 'Curitiba',
    });
  });

  it('normalizes v1 weather query parameters', () => {
    const query = weatherQuerySchema.parse({
      cityId: 'curitiba-br',
      cityName: 'Curitiba',
      country: 'Brasil',
      lat: '-25.43',
      lon: '-49.27',
      region: 'Parana',
      timezone: 'America/Sao_Paulo',
    });

    expect(query).toMatchObject({
      cityId: 'curitiba-br',
      cityName: 'Curitiba',
      country: 'Brasil',
      lat: -25.43,
      lon: -49.27,
      region: 'Parana',
      timezone: 'America/Sao_Paulo',
    });
  });

  it('rejects invalid weather coordinates', () => {
    expect(() => weatherQuerySchema.parse({
      lat: 'invalid',
      lon: '-49.27',
    })).toThrow();
  });
});
