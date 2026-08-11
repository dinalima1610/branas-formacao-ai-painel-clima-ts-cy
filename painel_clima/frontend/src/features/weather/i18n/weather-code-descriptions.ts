import type { WeatherLanguage } from '@/features/weather/types'

const weatherCodeDescriptions = {
  'en-US': {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  },
  'pt-BR': {
    0: 'Céu limpo',
    1: 'Predomínio de sol',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Neblina',
    48: 'Neblina com geada',
    51: 'Chuvisco fraco',
    53: 'Chuvisco moderado',
    55: 'Chuvisco intenso',
    56: 'Chuvisco congelante fraco',
    57: 'Chuvisco congelante intenso',
    61: 'Chuva fraca',
    63: 'Chuva moderada',
    65: 'Chuva forte',
    66: 'Chuva congelante fraca',
    67: 'Chuva congelante forte',
    71: 'Neve fraca',
    73: 'Neve moderada',
    75: 'Neve forte',
    77: 'Grãos de neve',
    80: 'Pancadas de chuva fracas',
    81: 'Pancadas de chuva moderadas',
    82: 'Pancadas de chuva violentas',
    85: 'Pancadas de neve fracas',
    86: 'Pancadas de neve fortes',
    95: 'Trovoada',
    96: 'Trovoada com granizo fraco',
    99: 'Trovoada com granizo forte',
  },
} satisfies Record<WeatherLanguage, Record<number, string>>

export function describeWeatherCode(weatherCode: number, language: WeatherLanguage): string {
  const descriptions: Record<number, string> = weatherCodeDescriptions[language]
  return descriptions[weatherCode] ?? getUnknownDescription(language, weatherCode)
}

function getUnknownDescription(language: WeatherLanguage, weatherCode: number): string {
  if (language === 'en-US') {
    return `Unknown condition (${weatherCode})`
  }

  return `Condição desconhecida (${weatherCode})`
}
