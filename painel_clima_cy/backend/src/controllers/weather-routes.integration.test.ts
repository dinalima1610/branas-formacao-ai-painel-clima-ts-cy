import { describe, expect, it, vi } from 'vitest';

import { createApp } from '../app';
import forecastFixture from '../data/fixtures/forecast-sao-paulo.json';
import geocodingEmptyFixture from '../data/fixtures/geocoding-empty.json';
import geocodingReverseFixture from '../data/fixtures/geocoding-reverse-sao-paulo.json';
import geocodingSearchFixture from '../data/fixtures/geocoding-search-sao-paulo.json';
import { startHttpServer } from '../test/http-server';

const jsonResponse = (body: unknown, status = 200): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  });
};

const createUpstreamFetch = (): typeof fetch => {
  return vi.fn(async (input: RequestInfo | URL): Promise<Response> => {
    const url = new URL(String(input));

    if (url.hostname === 'api.open-meteo.com') {
      return jsonResponse(forecastFixture);
    }

    if (url.pathname.endsWith('/reverse')) {
      return jsonResponse(geocodingReverseFixture);
    }

    if (url.searchParams.get('name') === 'zzzznotaplace') {
      return jsonResponse(geocodingEmptyFixture);
    }

    return jsonResponse(geocodingSearchFixture);
  }) as typeof fetch;
};

describe('weather HTTP integration routes', () => {
  it('GET /places/search?q=São Paulo returns candidate array shape', async () => {
    const server = await startHttpServer(createApp({ fetchClient: createUpstreamFetch() }));

    try {
      const response = await fetch(`${server.baseUrl}/places/search?q=${encodeURIComponent('São Paulo')}`);
      const body = await response.json() as { places: Array<{ label: string }> };

      expect(response.status).toBe(200);
      expect(body.places.length).toBeGreaterThan(0);
      expect(body.places[0]).toMatchObject({
        label: 'São Paulo, São Paulo, Brasil'
      });
    } finally {
      await server.close();
    }
  });

  it('GET /places/search?q=zzzznotaplace returns 404 PLACE_NOT_FOUND', async () => {
    const server = await startHttpServer(createApp({ fetchClient: createUpstreamFetch() }));

    try {
      const response = await fetch(`${server.baseUrl}/places/search?q=zzzznotaplace`);
      const body = await response.json() as { code: string };

      expect(response.status).toBe(404);
      expect(body.code).toBe('PLACE_NOT_FOUND');
    } finally {
      await server.close();
    }
  });

  it('GET /places/reverse returns candidate array shape', async () => {
    const server = await startHttpServer(createApp({ fetchClient: createUpstreamFetch() }));

    try {
      const response = await fetch(`${server.baseUrl}/places/reverse?latitude=-23.55&longitude=-46.63`);
      const body = await response.json() as { places: unknown[] };

      expect(response.status).toBe(200);
      expect(body.places).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  it('GET /weather returns WeatherPanelPayload with current, hourly, daily, and meta', async () => {
    const server = await startHttpServer(createApp({ fetchClient: createUpstreamFetch() }));

    try {
      const response = await fetch(
        `${server.baseUrl}/weather?latitude=-23.55&longitude=-46.63&temperatureUnit=celsius`
      );
      const body = await response.json() as {
        current?: unknown;
        daily?: unknown[];
        hourly?: unknown[];
        meta?: { temperatureUnit?: string };
      };

      expect(response.status).toBe(200);
      expect(body.current).toBeDefined();
      expect(body.hourly).toHaveLength(24);
      expect(body.daily).toHaveLength(5);
      expect(body.meta?.temperatureUnit).toBe('celsius');
    } finally {
      await server.close();
    }
  });

  it('GET /health continues to return 200', async () => {
    const server = await startHttpServer(createApp({ fetchClient: createUpstreamFetch() }));

    try {
      const response = await fetch(`${server.baseUrl}/health`);
      const body = await response.json() as { status: string };

      expect(response.status).toBe(200);
      expect(body.status).toBe('healthy');
    } finally {
      await server.close();
    }
  });

  it('returns 400 for invalid place and weather query params', async () => {
    const server = await startHttpServer(createApp({ fetchClient: createUpstreamFetch() }));

    try {
      const missingSearch = await fetch(`${server.baseUrl}/places/search`);
      const shortSearch = await fetch(`${server.baseUrl}/places/search?q=a`);
      const invalidCount = await fetch(`${server.baseUrl}/places/search?q=abc&count=8`);
      const missingReverse = await fetch(`${server.baseUrl}/places/reverse?longitude=-46.63`);
      const invalidLatitude = await fetch(
        `${server.baseUrl}/weather?latitude=-123&longitude=-46.63&temperatureUnit=celsius`
      );
      const invalidUnit = await fetch(
        `${server.baseUrl}/weather?latitude=-23.55&longitude=-46.63&temperatureUnit=kelvin`
      );
      const invalidUnitBody = await invalidUnit.json() as { code: string };

      expect(missingSearch.status).toBe(400);
      expect(shortSearch.status).toBe(400);
      expect(invalidCount.status).toBe(400);
      expect(missingReverse.status).toBe(400);
      expect(invalidLatitude.status).toBe(400);
      expect(invalidUnit.status).toBe(400);
      expect(invalidUnitBody.code).toBe('INVALID_QUERY');
    } finally {
      await server.close();
    }
  });

  it('maps upstream errors to 502 with JSON error body', async () => {
    const upstreamFetch = vi.fn(async (): Promise<Response> => jsonResponse({ error: true }, 503)) as typeof fetch;
    const server = await startHttpServer(createApp({ fetchClient: upstreamFetch }));

    try {
      const response = await fetch(`${server.baseUrl}/places/search?q=${encodeURIComponent('SÃ£o Paulo')}`);
      const body = await response.json() as { code: string; message: string };

      expect(response.status).toBe(502);
      expect(body.code).toBe('UPSTREAM_WEATHER_ERROR');
      expect(body.message).toContain('Open-Meteo');
    } finally {
      await server.close();
    }
  });
});
