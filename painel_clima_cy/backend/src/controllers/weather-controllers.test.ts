import express, { Express } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { OpenMeteoGeocodingPlace } from '../data/clients/open-meteo-geocoding.client';
import { UpstreamWeatherError } from '../errors/domain-errors';
import { PlacesService, PlacesServiceClient } from '../services/places.service';
import { startHttpServer } from '../test/http-server';
import { domainErrorHandler, fallbackErrorHandler } from './error-handler';
import { createPlacesRouter } from './places.controller';
import { createWeatherRouter } from './weather.controller';

const createControllerApp = (): Express => {
  const app = express();
  app.use('/places', createPlacesRouter());
  app.use('/weather', createWeatherRouter());
  app.use(domainErrorHandler);
  app.use(fallbackErrorHandler);
  return app;
};

const createPlacesErrorApp = (): Express => {
  const client: PlacesServiceClient = {
    search: vi.fn(async () => {
      throw new UpstreamWeatherError('Open-Meteo geocoding request failed');
    }),
    reverse: vi.fn(async (): Promise<OpenMeteoGeocodingPlace[]> => [])
  };
  const app = express();
  app.use('/places', createPlacesRouter(new PlacesService(client)));
  app.use(domainErrorHandler);
  app.use(fallbackErrorHandler);
  return app;
};

describe('weather controllers', () => {
  it('returns 400 when q is missing or shorter than 2 characters', async () => {
    const server = await startHttpServer(createControllerApp());

    try {
      const missingResponse = await fetch(`${server.baseUrl}/places/search`);
      const shortResponse = await fetch(`${server.baseUrl}/places/search?q=a`);

      expect(missingResponse.status).toBe(400);
      expect(shortResponse.status).toBe(400);
    } finally {
      await server.close();
    }
  });

  it('returns 400 when weather query params are invalid', async () => {
    const server = await startHttpServer(createControllerApp());

    try {
      const response = await fetch(
        `${server.baseUrl}/weather?latitude=-123&longitude=-46.63&temperatureUnit=kelvin`
      );
      const body = await response.json() as { code: string };

      expect(response.status).toBe(400);
      expect(body.code).toBe('INVALID_QUERY');
    } finally {
      await server.close();
    }
  });

  it('maps UpstreamWeatherError to 502 with JSON code and message', async () => {
    const server = await startHttpServer(createPlacesErrorApp());

    try {
      const response = await fetch(`${server.baseUrl}/places/search?q=São%20Paulo`);
      const body = await response.json() as { code: string; message: string };

      expect(response.status).toBe(502);
      expect(body.code).toBe('UPSTREAM_WEATHER_ERROR');
      expect(body.message).toContain('Open-Meteo');
    } finally {
      await server.close();
    }
  });
});
