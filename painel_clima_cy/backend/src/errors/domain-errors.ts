export type DomainErrorCode =
  | 'INVALID_QUERY'
  | 'PLACE_NOT_FOUND'
  | 'UPSTREAM_WEATHER_ERROR';

export class DomainError extends Error {
  readonly code: DomainErrorCode;

  constructor(code: DomainErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = new.target.name;
  }
}

export class InvalidQueryError extends DomainError {
  readonly statusCode: 400 | 422;

  constructor(message: string, statusCode: 400 | 422 = 422) {
    super('INVALID_QUERY', message);
    this.statusCode = statusCode;
  }
}

export class PlaceNotFoundError extends DomainError {
  constructor(message = 'No matching place was found') {
    super('PLACE_NOT_FOUND', message);
  }
}

export class UpstreamWeatherError extends DomainError {
  constructor(message = 'Weather data provider is unavailable') {
    super('UPSTREAM_WEATHER_ERROR', message);
  }
}
