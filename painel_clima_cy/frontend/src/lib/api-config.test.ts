import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApiUrl, defaultApiBaseUrl, getApiBaseUrl } from './api-config';

describe('api-config', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns import.meta.env.VITE_API_BASE_URL when it is set', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');

    expect(getApiBaseUrl()).toBe('https://api.example.test');
  });

  it('falls back to the local backend when VITE_API_BASE_URL is unset', () => {
    expect(getApiBaseUrl({ DEV: true })).toBe(defaultApiBaseUrl);
  });

  it('requires VITE_API_BASE_URL outside development mode', () => {
    expect(() => getApiBaseUrl({ DEV: false })).toThrow('VITE_API_BASE_URL must be set for public builds.');
  });

  it('builds API URLs from a base without trailing slash and a path with leading slash', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://example.com/painel_clima_cy');

    const url = buildApiUrl('/health');

    expect(url.toString()).toBe('https://example.com/painel_clima_cy/health');
  });

  it('builds API URLs from a base with trailing slash and a path with leading slash', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://example.com/painel_clima_cy/');

    const url = buildApiUrl('/health');

    expect(url.toString()).toBe('https://example.com/painel_clima_cy/health');
  });

  it('builds API URLs from a path without leading slash', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://example.com/painel_clima_cy');

    const url = buildApiUrl('weather');

    expect(url.toString()).toBe('https://example.com/painel_clima_cy/weather');
  });

  it('builds API URLs with query parameters while preserving the configured base path', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://example.com/painel_clima_cy');

    const url = buildApiUrl('/places/search', { q: 'Curitiba' });

    expect(url.toString()).toBe('https://example.com/painel_clima_cy/places/search?q=Curitiba');
  });

  it('builds local API URLs from the shared base URL', () => {
    const url = buildApiUrl('/weather', {
      latitude: '-23.55',
      longitude: '-46.63',
      temperatureUnit: 'celsius',
    });

    expect(url.toString()).toBe(
      'http://localhost:3000/weather?latitude=-23.55&longitude=-46.63&temperatureUnit=celsius',
    );
  });
});
