import { ErrorRequestHandler } from 'express';
import {
  DomainError,
  InvalidQueryError,
  PlaceNotFoundError,
  UpstreamWeatherError
} from '../errors/domain-errors';

const getStatusCode = (error: DomainError): number => {
  if (error instanceof InvalidQueryError) {
    return error.statusCode;
  }

  if (error instanceof PlaceNotFoundError) {
    return 404;
  }

  if (error instanceof UpstreamWeatherError) {
    return 502;
  }

  return 500;
};

export const domainErrorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (error instanceof DomainError) {
    res.status(getStatusCode(error)).json({
      code: error.code,
      message: error.message
    });
    return;
  }

  next(error);
};

export const fallbackErrorHandler: ErrorRequestHandler = (error: Error, _req, res, _next) => {
  console.error(error.stack);
  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: error.message
  });
};
