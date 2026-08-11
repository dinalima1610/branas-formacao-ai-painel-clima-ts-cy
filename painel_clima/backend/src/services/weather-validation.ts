import {
  MIN_LOCATION_QUERY_LENGTH,
  WeatherError,
  type CoordinatesInput,
} from '../types/weather';

const MAX_LATITUDE = 90;
const MIN_LATITUDE = -90;
const MAX_LONGITUDE = 180;
const MIN_LONGITUDE = -180;

export function normalizeLocationQuery(query: string): string {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < MIN_LOCATION_QUERY_LENGTH) {
    throw new WeatherError({
      code: 'INVALID_LOCATION_QUERY',
      message: 'Informe uma cidade com pelo menos 2 caracteres.',
      statusCode: 422,
      details: {
        minLength: MIN_LOCATION_QUERY_LENGTH,
      },
    });
  }

  return normalizedQuery;
}

export function validateCoordinates(input: CoordinatesInput): CoordinatesInput {
  const hasValidLatitude = Number.isFinite(input.latitude)
    && input.latitude >= MIN_LATITUDE
    && input.latitude <= MAX_LATITUDE;
  const hasValidLongitude = Number.isFinite(input.longitude)
    && input.longitude >= MIN_LONGITUDE
    && input.longitude <= MAX_LONGITUDE;

  if (!hasValidLatitude || !hasValidLongitude) {
    throw new WeatherError({
      code: 'INVALID_COORDINATES',
      message: 'Informe latitude entre -90 e 90 e longitude entre -180 e 180.',
      statusCode: 422,
    });
  }

  return input;
}

export function createCoordinateLocationId(input: CoordinatesInput): string {
  return `coordinates:${roundCoordinate(input.latitude)},${roundCoordinate(input.longitude)}`;
}

function roundCoordinate(value: number): string {
  return value.toFixed(4);
}
