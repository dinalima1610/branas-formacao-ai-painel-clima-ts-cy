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

  it('builds API URLs from the shared base URL', () => {
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
