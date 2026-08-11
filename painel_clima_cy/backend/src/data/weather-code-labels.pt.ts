import type { WeatherCondition } from '../types/weather';

const weatherCodeLabels: Record<number, WeatherCondition> = {
  0: { label: 'Céu limpo', iconKey: 'sunny' },
  1: { label: 'Predominantemente limpo', iconKey: 'partly-cloudy' },
  2: { label: 'Parcialmente nublado', iconKey: 'partly-cloudy' },
  3: { label: 'Nublado', iconKey: 'cloudy' },
  45: { label: 'Nevoeiro', iconKey: 'fog' },
  48: { label: 'Nevoeiro com geada', iconKey: 'fog' },
  51: { label: 'Garoa leve', iconKey: 'drizzle' },
  53: { label: 'Garoa moderada', iconKey: 'drizzle' },
  55: { label: 'Garoa intensa', iconKey: 'drizzle' },
  56: { label: 'Garoa congelante leve', iconKey: 'drizzle' },
  57: { label: 'Garoa congelante intensa', iconKey: 'drizzle' },
  61: { label: 'Chuva leve', iconKey: 'rain' },
  63: { label: 'Chuva moderada', iconKey: 'rain' },
  65: { label: 'Chuva forte', iconKey: 'rain' },
  66: { label: 'Chuva congelante leve', iconKey: 'rain' },
  67: { label: 'Chuva congelante forte', iconKey: 'rain' },
  71: { label: 'Neve leve', iconKey: 'snow' },
  73: { label: 'Neve moderada', iconKey: 'snow' },
  75: { label: 'Neve forte', iconKey: 'snow' },
  77: { label: 'Grãos de neve', iconKey: 'snow' },
  80: { label: 'Pancadas de chuva leves', iconKey: 'rain' },
  81: { label: 'Pancadas de chuva moderadas', iconKey: 'rain' },
  82: { label: 'Pancadas de chuva fortes', iconKey: 'rain' },
  85: { label: 'Pancadas de neve leves', iconKey: 'snow' },
  86: { label: 'Pancadas de neve fortes', iconKey: 'snow' },
  95: { label: 'Trovoada', iconKey: 'thunderstorm' },
  96: { label: 'Trovoada com granizo leve', iconKey: 'thunderstorm' },
  99: { label: 'Trovoada com granizo forte', iconKey: 'thunderstorm' }
};

const unknownCondition: WeatherCondition = {
  label: 'Condição desconhecida',
  iconKey: 'unknown'
};

export const getWeatherCondition = (weatherCode: number): WeatherCondition => {
  return weatherCodeLabels[weatherCode] ?? unknownCondition;
};
