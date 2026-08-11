import { createCoordinateLocationId, normalizeLocationQuery, validateCoordinates } from './weather-validation';
import { describeWeatherCode } from './wmo-weather-codes';
import {
  FORECAST_DAYS,
  WeatherError,
  type CoordinatesInput,
  type LocationOption,
  type LocationSuggestion,
  type ReverseGeocodingClient,
  type SearchLocationsInput,
  type WeatherPanelData,
  type WeatherProviderClient,
  type WeatherQueryInput,
  type WeatherService,
} from '../types/weather';

interface WeatherServiceDependencies {
  weatherProviderClient: WeatherProviderClient;
  reverseGeocodingClient: ReverseGeocodingClient;
}

export class DefaultWeatherService implements WeatherService {
  private readonly reverseGeocodingClient: ReverseGeocodingClient;
  private readonly weatherProviderClient: WeatherProviderClient;

  constructor(dependencies: WeatherServiceDependencies) {
    this.weatherProviderClient = dependencies.weatherProviderClient;
    this.reverseGeocodingClient = dependencies.reverseGeocodingClient;
  }

  async searchLocations(input: SearchLocationsInput): Promise<LocationOption[]> {
    const query = normalizeLocationQuery(input.query);
    const language = input.language ?? 'pt';
    return this.weatherProviderClient.searchLocations(query, language);
  }

  async reverseLocation(input: CoordinatesInput): Promise<LocationSuggestion> {
    const coordinates = validateCoordinates(input);

    try {
      const suggestion = await this.reverseGeocodingClient.findNearestCity(coordinates);

      if (suggestion !== null) {
        return suggestion;
      }
    } catch {
      return this.createCoordinateSuggestion(coordinates);
    }

    return this.createCoordinateSuggestion(coordinates);
  }

  async getWeather(input: WeatherQueryInput): Promise<WeatherPanelData> {
    const coordinates = validateCoordinates(input);
    const forecast = await this.weatherProviderClient.getForecast(coordinates);

    if (forecast.dailyForecast.length !== FORECAST_DAYS) {
      throw new WeatherError({
        code: 'WEATHER_PROVIDER_INCOMPLETE',
        message: 'A previsao recebida esta incompleta.',
        statusCode: 502,
      });
    }

    return {
      location: this.createWeatherLocation(input, forecast.timezone),
      current: {
        ...forecast.current,
        condition: describeWeatherCode(forecast.current.weatherCode),
      },
      dailyForecast: forecast.dailyForecast.map((dailyForecast) => ({
        ...dailyForecast,
        condition: describeWeatherCode(dailyForecast.weatherCode),
      })),
      source: {
        provider: 'open-meteo',
        name: 'Open-Meteo',
        url: 'https://open-meteo.com/',
      },
      generatedAt: new Date().toISOString(),
    };
  }

  private createWeatherLocation(input: WeatherQueryInput, fallbackTimezone?: string): LocationOption {
    const id = input.location?.id ?? input.locationId ?? createCoordinateLocationId(input);
    const name = input.location?.name?.trim() || 'Localizacao selecionada';

    return {
      id,
      name,
      admin1: input.location?.admin1,
      country: input.location?.country,
      countryCode: input.location?.countryCode,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.location?.timezone ?? fallbackTimezone,
    };
  }

  private createCoordinateSuggestion(input: CoordinatesInput): LocationSuggestion {
    return {
      location: {
        id: createCoordinateLocationId(input),
        name: 'Localizacao atual',
        latitude: input.latitude,
        longitude: input.longitude,
      },
      source: 'coordinates',
      confidence: 'fallback',
      message: 'Use as coordenadas autorizadas pelo navegador para consultar o clima.',
    };
  }
}
