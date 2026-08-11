import { InvalidQueryError } from '../errors/domain-errors';
import { temperatureUnits, TemperatureUnit } from '../types/weather';

export const readStringQuery = (value: unknown, name: string): string => {
  if (typeof value !== 'string') {
    throw new InvalidQueryError(`Query parameter "${name}" is required`, 400);
  }

  return value.trim();
};

export const readOptionalCount = (value: unknown): number | undefined => {
  if (value === undefined) {
    return undefined;
  }

  const rawValue = readStringQuery(value, 'count');
  const count = Number(rawValue);

  if (!Number.isInteger(count) || count < 1 || count > 5) {
    throw new InvalidQueryError('Query parameter "count" must be an integer between 1 and 5', 400);
  }

  return count;
};

export const readCoordinateQuery = (value: unknown, name: string, min: number, max: number): number => {
  const rawValue = readStringQuery(value, name);
  const coordinate = Number(rawValue);

  if (!Number.isFinite(coordinate) || coordinate < min || coordinate > max) {
    throw new InvalidQueryError(`Query parameter "${name}" must be between ${min} and ${max}`, 400);
  }

  return coordinate;
};

export const readTemperatureUnit = (value: unknown): TemperatureUnit => {
  const unit = readStringQuery(value, 'temperatureUnit');

  if (!temperatureUnits.includes(unit as TemperatureUnit)) {
    throw new InvalidQueryError('Query parameter "temperatureUnit" must be "celsius" or "fahrenheit"', 400);
  }

  return unit as TemperatureUnit;
};
