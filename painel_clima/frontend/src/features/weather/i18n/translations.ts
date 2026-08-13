import type { WeatherLanguage, WeatherMessages } from '@/features/weather/types'

export const DEFAULT_WEATHER_LANGUAGE: WeatherLanguage = 'pt-BR'
export const WEATHER_LANGUAGES: WeatherLanguage[] = ['pt-BR', 'en-US']

export const weatherTranslations = {
  'en-US': {
    attribution: {
      prefix: 'Weather data by',
      reverseGeocodingPrefix: 'and reverse geocoding by',
    },
    current: {
      feelsLike: 'Feels like',
      humidity: 'Humidity',
      updatedAt: 'Updated at',
      wind: 'Wind',
    },
    forecast: {
      title: 'Next 7 days',
    },
    geolocation: {
      action: 'Use my location',
      currentLocation: 'My location',
      permissionDenied: 'Permission denied. City search is still available.',
      positionUnavailable: 'Could not detect your location. Search for a city instead.',
      requesting: 'Requesting location',
      timeout: 'Location detection took too long. Try searching for a city.',
      unknown: 'Could not use your location. City search is still available.',
      unsupported: 'Geolocation is unavailable in this browser. Use city search.',
    },
    language: {
      english: 'English',
      label: 'Language',
      portuguese: 'Portuguese',
    },
    page: {
      description: 'Check temperature, feels like, wind, humidity and a 7 day forecast by city.',
      eyebrow: 'Public weather panel',
      heading: 'Current weather and 7 day forecast',
      searchDescription: 'Search for a city or authorize your location only when you want local weather.',
      title: 'Painel do Clima',
    },
    search: {
      empty: 'No city found for this term.',
      error: 'Could not search cities right now.',
      fallbackRegion: 'Coordinates available',
      heading: 'Search city',
      hint: 'Type at least 2 characters and select a city.',
      label: 'City',
      loading: 'Searching matching cities.',
      placeholder: 'Type at least 2 characters',
      resultsLabel: 'City results',
      selectCity: 'Select',
    },
    state: {
      emptyDescription: 'You can also use your location when you want.',
      emptyTitle: 'Search for a city to see the weather.',
      errorDescription: 'Try again in a few moments.',
      errorTitle: 'Could not load the weather.',
      loadingDescription: 'The request should finish in a few seconds.',
      loadingTitle: 'Loading current weather and forecast.',
      retry: 'Try again',
    },
    units: {
      imperial: '°F / mph',
      label: 'Units',
      metric: '°C / km/h',
    },
  },
  'pt-BR': {
    attribution: {
      prefix: 'Dados meteorológicos por',
      reverseGeocodingPrefix: 'e geocodificação reversa por',
    },
    current: {
      feelsLike: 'Sensação térmica',
      humidity: 'Umidade',
      updatedAt: 'Atualizado em',
      wind: 'Vento',
    },
    forecast: {
      title: 'Próximos 7 dias',
    },
    geolocation: {
      action: 'Usar minha localização',
      currentLocation: 'Minha localização',
      permissionDenied: 'Permissão negada. A busca por cidade continua disponível.',
      positionUnavailable: 'Não foi possível detectar sua localização. Busque uma cidade manualmente.',
      requesting: 'Solicitando localização',
      timeout: 'A detecção de localização demorou demais. Tente buscar pela cidade.',
      unknown: 'Não foi possível usar sua localização. A busca por cidade continua disponível.',
      unsupported: 'Geolocalização indisponível neste navegador. Use a busca por cidade.',
    },
    language: {
      english: 'Inglês',
      label: 'Idioma',
      portuguese: 'Português',
    },
    page: {
      description: 'Consulte temperatura, sensação térmica, vento, umidade e previsão de 7 dias por cidade.',
      eyebrow: 'Painel público de clima',
      heading: 'Clima atual e previsão de 7 dias',
      searchDescription: 'Busque uma cidade ou autorize sua localização apenas quando quiser consultar o clima local.',
      title: 'Painel do Clima',
    },
    search: {
      empty: 'Nenhuma cidade encontrada para esse termo.',
      error: 'Não foi possível buscar cidades agora.',
      fallbackRegion: 'Coordenadas disponíveis',
      heading: 'Buscar cidade',
      hint: 'Digite ao menos 2 caracteres e selecione uma cidade.',
      label: 'Cidade',
      loading: 'Buscando cidades correspondentes.',
      placeholder: 'Digite ao menos 2 caracteres',
      resultsLabel: 'Resultados de cidades',
      selectCity: 'Selecionar',
    },
    state: {
      emptyDescription: 'Você também pode usar sua localização quando quiser.',
      emptyTitle: 'Busque uma cidade para ver o clima.',
      errorDescription: 'Tente novamente em instantes.',
      errorTitle: 'Não foi possível carregar o clima.',
      loadingDescription: 'A consulta deve terminar em poucos segundos.',
      loadingTitle: 'Carregando clima atual e previsão.',
      retry: 'Tentar novamente',
    },
    units: {
      imperial: '°F / mph',
      label: 'Unidades',
      metric: '°C / km/h',
    },
  },
} satisfies Record<WeatherLanguage, WeatherMessages>

export function isWeatherLanguage(value: string): value is WeatherLanguage {
  return WEATHER_LANGUAGES.includes(value as WeatherLanguage)
}
