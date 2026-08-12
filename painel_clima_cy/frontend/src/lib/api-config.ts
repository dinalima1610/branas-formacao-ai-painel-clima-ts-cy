export const defaultApiBaseUrl = 'http://localhost:3000';

interface ApiBaseUrlEnv {
  readonly DEV?: boolean;
  readonly VITE_API_BASE_URL?: string;
}

export function getApiBaseUrl(env: ApiBaseUrlEnv = import.meta.env) {
  const configuredBaseUrl = env.VITE_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    if (env.DEV) {
      return defaultApiBaseUrl;
    }

    throw new Error('VITE_API_BASE_URL must be set for public builds.');
  }

  return configuredBaseUrl.replace(/\/+$/, '');
}

export function buildApiUrl(path: string, searchParams: Record<string, string> = {}) {
  const baseUrl = `${getApiBaseUrl().replace(/\/+$/, '')}/`;
  const normalizedPath = path.replace(/^\/+/, '');
  const url = new URL(normalizedPath, baseUrl);

  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url;
}
