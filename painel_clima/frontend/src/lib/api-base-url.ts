export function getApiBaseUrl(): string {
  const configuredBaseUrl = (import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL)?.trim()

  if (configuredBaseUrl === undefined || configuredBaseUrl.length === 0) {
    if (import.meta.env.DEV) {
      return ''
    }

    throw new Error('VITE_API_URL must be set for public builds.')
  }

  return configuredBaseUrl.replace(/\/$/, '')
}
