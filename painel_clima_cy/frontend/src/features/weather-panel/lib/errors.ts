import { WeatherApiError } from '../api/weather-api';

export interface FriendlyWeatherError {
  title: string;
  description: string;
  canRetry: boolean;
}

export function mapWeatherError(error: unknown): FriendlyWeatherError {
  if (isGeolocationError(error)) {
    return {
      title: 'Localização não autorizada',
      description: 'Sem problema. Você ainda pode buscar uma cidade manualmente.',
      canRetry: false,
    };
  }

  if (error instanceof WeatherApiError) {
    if (error.code === 'PLACE_NOT_FOUND' || error.status === 404) {
      return {
        title: 'Não encontramos esse lugar',
        description: 'Tente buscar por uma cidade maior ou inclua estado e país.',
        canRetry: false,
      };
    }

    if (error.status === 502 || error.code.includes('UPSTREAM')) {
      return {
        title: 'Previsão temporariamente indisponível',
        description: 'O serviço de clima demorou para responder. Tente novamente em instantes.',
        canRetry: true,
      };
    }

    return {
      title: 'Não foi possível concluir a busca',
      description: 'Revise os dados informados e tente novamente.',
      canRetry: false,
    };
  }

  return {
    title: 'Algo saiu do esperado',
    description: 'Tente novamente ou busque outra cidade.',
    canRetry: true,
  };
}

function isGeolocationError(error: unknown) {
  if (typeof GeolocationPositionError !== 'undefined' && error instanceof GeolocationPositionError) {
    return true;
  }

  return isGeolocationDenied(error) || isGeolocationUnavailable(error);
}

function isGeolocationDenied(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    Number((error as { code: unknown }).code) === 1
  );
}

function isGeolocationUnavailable(error: unknown) {
  return error instanceof Error && error.message === 'GEOLOCATION_UNAVAILABLE';
}
