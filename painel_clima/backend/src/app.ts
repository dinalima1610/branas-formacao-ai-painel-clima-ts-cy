import cors, { type CorsOptions } from 'cors';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';

import { createWeatherRouter, createWeatherV1Router } from './controllers/weather.controller';
import { GoogleGeocodingClient } from './data/clients/google-geocoding.client';
import { NominatimReverseGeocodingClient } from './data/clients/nominatim-reverse-geocoding.client';
import { OpenMeteoClient } from './data/clients/open-meteo.client';
import { DefaultWeatherService } from './services/weather.service';
import {
  WeatherError,
  type ApiErrorResponse,
  type CoordinatesInput,
  type LocationSuggestion,
  type ReverseGeocodingClient,
  type WeatherService,
} from './types/weather';

interface AppDependencies {
  weatherService?: WeatherService;
}

export function createApp(dependencies: AppDependencies = {}): Express {
  const app = express();
  const weatherService = dependencies.weatherService ?? createDefaultWeatherService();

  app.use(cors(createCorsOptions()));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_request: Request, response: Response) => {
    response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/v0', createWeatherRouter(weatherService));
  app.use('/api/v1', createWeatherV1Router(weatherService));
  app.use(handleHttpError);

  return app;
}

function createCorsOptions(): CorsOptions {
  const configuredOrigin = process.env.CORS_ORIGIN;

  if (configuredOrigin === undefined || configuredOrigin.trim().length === 0) {
    return {};
  }

  return {
    origin: configuredOrigin
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
  };
}

function createDefaultWeatherService(): WeatherService {
  return new DefaultWeatherService({
    weatherProviderClient: new OpenMeteoClient(),
    reverseGeocodingClient: new FallbackReverseGeocodingClient([
      new GoogleGeocodingClient({
        apiKey: process.env.GOOGLE_GEOCODING_API_KEY,
      }),
      new NominatimReverseGeocodingClient({
        userAgent: process.env.NOMINATIM_USER_AGENT,
      }),
    ]),
  });
}

class FallbackReverseGeocodingClient implements ReverseGeocodingClient {
  constructor(private readonly clients: ReverseGeocodingClient[]) {}

  async findNearestCity(input: CoordinatesInput): Promise<LocationSuggestion | null> {
    for (const client of this.clients) {
      try {
        const suggestion = await client.findNearestCity(input);

        if (suggestion !== null) {
          return suggestion;
        }
      } catch {
        // Try the next reverse geocoding provider before falling back to coordinates.
      }
    }

    return null;
  }
}

function handleHttpError(
  error: Error,
  _request: Request,
  response: Response<ApiErrorResponse>,
  _next: NextFunction,
): void {
  if (error instanceof WeatherError) {
    response.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'Nao foi possivel concluir a solicitacao agora.',
  });
}
