export function getApiBaseUrl(): string {
  const configuredBaseUrl = (import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL)?.trim()

  if (configuredBaseUrl === undefined || configuredBaseUrl.length === 0) {
    return ''
  }

  return configuredBaseUrl.replace(/\/$/, '')
}
