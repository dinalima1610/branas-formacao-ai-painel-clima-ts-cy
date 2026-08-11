export const defaultApiBaseUrl = 'http://localhost:3000';

interface ApiBaseUrlEnv {
  readonly VITE_API_BASE_URL?: string;
}

export function getApiBaseUrl(env: ApiBaseUrlEnv = import.meta.env) {
  const configuredBaseUrl = env.VITE_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return defaultApiBaseUrl;
  }

  return configuredBaseUrl.replace(/\/+$/, '');
}

export function buildApiUrl(path: string, searchParams: Record<string, string> = {}) {
  const url = new URL(path, getApiBaseUrl());

  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url;
}
