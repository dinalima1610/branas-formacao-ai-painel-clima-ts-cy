import { describe, expect, it } from 'vitest';

import { createCoordinateLocationId, normalizeLocationQuery, validateCoordinates } from './weather-validation';

describe('weather validation', () => {
  it('normalizes a valid city query', () => {
    const query = normalizeLocationQuery('  Lisboa  ');

    expect(query).toBe('Lisboa');
  });

  it('rejects a city query shorter than two characters', () => {
    expect(() => normalizeLocationQuery('a')).toThrow('Informe uma cidade com pelo menos 2 caracteres.');
  });

  it('accepts coordinates inside the valid world bounds', () => {
    const coordinates = validateCoordinates({ latitude: -23.55, longitude: -46.63 });

    expect(coordinates).toEqual({ latitude: -23.55, longitude: -46.63 });
  });

  it('rejects coordinates outside the valid world bounds', () => {
    expect(() => validateCoordinates({ latitude: 91, longitude: -46.63 })).toThrow(
      'Informe latitude entre -90 e 90 e longitude entre -180 e 180.',
    );
  });

  it('creates a rounded coordinate based location id', () => {
    const locationId = createCoordinateLocationId({ latitude: -23.55555, longitude: -46.66666 });

    expect(locationId).toBe('coordinates:-23.5556,-46.6667');
  });
});
