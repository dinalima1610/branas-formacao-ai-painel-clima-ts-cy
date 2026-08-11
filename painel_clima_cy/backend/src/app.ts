import cors from 'cors';
import express, { ErrorRequestHandler, Express, Request, Response } from 'express';
import { domainErrorHandler, fallbackErrorHandler } from './controllers/error-handler';
import { createPlacesRouter } from './controllers/places.controller';
import { createWeatherRouter } from './controllers/weather.controller';
import { OpenMeteoForecastClient } from './data/clients/open-meteo-forecast.client';
import { OpenMeteoGeocodingClient } from './data/clients/open-meteo-geocoding.client';
import { NominatimReverseGeocodingClient } from './data/clients/nominatim-reverse-geocoding.client';
import { PlacesService } from './services/places.service';
import { WeatherService } from './services/weather.service';

export interface AppDependencies {
  fetchClient?: typeof fetch;
}

export const createApp = (dependencies: AppDependencies = {}): Express => {
  const app: Express = express();
  const geocodingClient = new OpenMeteoGeocodingClient({ fetchClient: dependencies.fetchClient });
  const reverseFallbackClient = new NominatimReverseGeocodingClient({ fetchClient: dependencies.fetchClient });
  const forecastClient = new OpenMeteoForecastClient({ fetchClient: dependencies.fetchClient });
  const placesService = new PlacesService(geocodingClient, reverseFallbackClient);
  const weatherService = new WeatherService(forecastClient, placesService);

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/places', createPlacesRouter(placesService));
  app.use('/weather', createWeatherRouter(weatherService));
  app.use(domainErrorHandler as ErrorRequestHandler);
  app.use(fallbackErrorHandler);

  return app;
};

export const app = createApp();
