import { Router, type NextFunction, type Request, type Response } from 'express';

import {
  type CoordinatesInput,
  type DailyForecast,
  type LocationContext,
  type LocationOption,
  type WeatherPanelData,
  type WeatherService,
} from '../types/weather';
import { WeatherError } from '../types/weather';
import {
  citySearchQuerySchema,
  type CitySearchQuery,
  type WeatherQuery,
  weatherQuerySchema,
} from '../schemas/weather.schema';

const DEFAULT_CITY_LIMIT = 5;
const DEFAULT_COUNTRY = 'Brasil';
const DEFAULT_TIMEZONE = 'auto';
const OPEN_METEO_URL = 'https://open-meteo.com';

type WeatherIcon =
  | 'sun'
  | 'cloud-sun'
  | 'cloud'
  | 'fog'
  | 'cloud-drizzle'
  | 'cloud-rain'
  | 'cloud-snow'
  | 'cloud-lightning'
  | 'cloud-question';

interface CityResponse {
  id: string;
  name: string;
  region?: string;
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface WeatherSnapshotResponse {
  city: CityResponse;
  current: {
    observedAt: string;
    temperatureC: number;
    feelsLikeC: number;
    weatherCode: number;
    description: string;
    icon: WeatherIcon;
    windSpeedKmh: number;
    humidityPercent: number;
  };
  daily: {
    date: string;
    minTemperatureC: number;
    maxTemperatureC: number;
    weatherCode: number;
    description: string;
    icon: WeatherIcon;
  }[];
  attribution: {
    provider: 'Open-Meteo';
    url: string;
  };
}

export function createWeatherRouter(weatherService: WeatherService): Router {
  const router = Router();

  router.get('/locations', async (request: Request, response: Response, next: NextFunction) => {
    try {
      const query = getQueryValue(request.query.query) ?? '';
      const language = getQueryValue(request.query.language);
      const locations = await weatherService.searchLocations({ query, language });
      response.json({ locations });
    } catch (error) {
      next(error);
    }
  });

  router.get('/locations/reverse', async (request: Request, response: Response, next: NextFunction) => {
    try {
      const coordinates = parseCoordinates(request);
      const suggestion = await weatherService.reverseLocation(coordinates);
      response.json(suggestion);
    } catch (error) {
      next(error);
    }
  });

  router.get('/weather', async (request: Request, response: Response, next: NextFunction) => {
    try {
      const coordinates = parseCoordinates(request);
      const weather = await weatherService.getWeather({
        ...coordinates,
        locationId: getQueryValue(request.query.locationId),
        location: parseLocationContext(request),
      });
      response.json(weather);
    } catch (error) {
      next(error);
    }
  });

  router.get('/openapi.json', (_request: Request, response: Response) => {
    response.json(createOpenApiDocument());
  });

  return router;
}

export function createWeatherV1Router(weatherService: WeatherService): Router {
  const router = Router();

  router.get('/cities/search', async (request: Request, response: Response, next: NextFunction) => {
    try {
      const searchQuery = parseCitySearchQuery(request.query);
      const locations = await weatherService.searchLocations({
        query: searchQuery.query,
        language: searchQuery.language,
      });

      response.json(locations.slice(0, searchQuery.limit ?? DEFAULT_CITY_LIMIT).map(mapLocationToCityResponse));
    } catch (error) {
      next(error);
    }
  });

  router.get('/weather', async (request: Request, response: Response, next: NextFunction) => {
    try {
      const query = parseWeatherQuery(request.query);
      const weather = await weatherService.getWeather({
        latitude: query.lat,
        longitude: query.lon,
        locationId: query.cityId,
        location: createV1LocationContext(query),
      });

      response.json(mapWeatherToSnapshotResponse(weather));
    } catch (error) {
      next(error);
    }
  });

  router.get('/openapi.json', (_request: Request, response: Response) => {
    response.json(createOpenApiDocument());
  });

  return router;
}

function parseCitySearchQuery(query: Request['query']): CitySearchQuery {
  const parsedQuery = citySearchQuerySchema.safeParse(query);

  if (!parsedQuery.success) {
    throw new WeatherError({
      code: 'INVALID_LOCATION_QUERY',
      message: 'Informe uma consulta de cidade valida.',
      statusCode: 422,
    });
  }

  return parsedQuery.data;
}

function parseWeatherQuery(query: Request['query']): WeatherQuery {
  const parsedQuery = weatherQuerySchema.safeParse(query);

  if (!parsedQuery.success) {
    throw new WeatherError({
      code: 'INVALID_COORDINATES',
      message: 'Informe latitude e longitude numericas.',
      statusCode: 422,
    });
  }

  return parsedQuery.data;
}

function parseCoordinates(request: Request): CoordinatesInput {
  const latitude = parseNumberQueryValue(request.query.latitude ?? request.query.lat);
  const longitude = parseNumberQueryValue(request.query.longitude ?? request.query.lon);

  if (latitude === undefined || longitude === undefined) {
    throw new WeatherError({
      code: 'INVALID_COORDINATES',
      message: 'Informe latitude e longitude numericas.',
      statusCode: 422,
    });
  }

  return { latitude, longitude };
}

function parseLocationContext(request: Request): LocationContext | undefined {
  const location: LocationContext = {
    id: getQueryValue(request.query.locationId),
    name: getQueryValue(request.query.locationName),
    admin1: getQueryValue(request.query.admin1),
    country: getQueryValue(request.query.country),
    countryCode: getQueryValue(request.query.countryCode),
    timezone: getQueryValue(request.query.timezone),
  };

  const hasContext = Object.values(location).some((value) => value !== undefined);
  return hasContext ? location : undefined;
}

function createV1LocationContext(query: WeatherQuery): LocationContext | undefined {
  const location: LocationContext = {
    id: query.cityId,
    name: query.cityName ?? query.city,
    admin1: query.region,
    country: query.country,
    countryCode: query.countryCode,
    timezone: query.timezone,
  };

  const hasContext = Object.values(location).some((value) => value !== undefined);
  return hasContext ? location : undefined;
}

function parseNumberQueryValue(value: unknown): number | undefined {
  const queryValue = getQueryValue(value);

  if (queryValue === undefined) {
    return undefined;
  }

  if (queryValue.trim().length === 0) {
    return undefined;
  }

  const numberValue = Number(queryValue);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function getQueryValue(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0];
  }

  return undefined;
}

function mapWeatherToSnapshotResponse(weather: WeatherPanelData): WeatherSnapshotResponse {
  return {
    attribution: {
      provider: 'Open-Meteo',
      url: weather.source.url || OPEN_METEO_URL,
    },
    city: mapLocationToCityResponse(weather.location),
    current: {
      description: weather.current.condition,
      feelsLikeC: weather.current.apparentTemperatureCelsius,
      humidityPercent: weather.current.relativeHumidityPercent,
      icon: mapWeatherCodeToIcon(weather.current.weatherCode),
      observedAt: weather.current.measuredAt,
      temperatureC: weather.current.temperatureCelsius,
      weatherCode: weather.current.weatherCode,
      windSpeedKmh: weather.current.windSpeedKmh,
    },
    daily: weather.dailyForecast.map(mapDailyForecastToResponse),
  };
}

function mapLocationToCityResponse(location: LocationOption): CityResponse {
  return {
    country: location.country ?? DEFAULT_COUNTRY,
    countryCode: location.countryCode,
    id: location.id,
    latitude: location.latitude,
    longitude: location.longitude,
    name: location.name,
    region: location.admin1,
    timezone: location.timezone ?? DEFAULT_TIMEZONE,
  };
}

function mapDailyForecastToResponse(day: DailyForecast): WeatherSnapshotResponse['daily'][number] {
  return {
    date: day.date,
    description: day.condition,
    icon: mapWeatherCodeToIcon(day.weatherCode),
    maxTemperatureC: day.maxTemperatureCelsius,
    minTemperatureC: day.minTemperatureCelsius,
    weatherCode: day.weatherCode,
  };
}

function mapWeatherCodeToIcon(weatherCode: number): WeatherIcon {
  if (weatherCode === 0) {
    return 'sun';
  }

  if (weatherCode === 1 || weatherCode === 2) {
    return 'cloud-sun';
  }

  if (weatherCode === 3) {
    return 'cloud';
  }

  if (weatherCode === 45 || weatherCode === 48) {
    return 'fog';
  }

  if (weatherCode >= 51 && weatherCode <= 57) {
    return 'cloud-drizzle';
  }

  if ((weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    return 'cloud-rain';
  }

  if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) {
    return 'cloud-snow';
  }

  if (weatherCode >= 95 && weatherCode <= 99) {
    return 'cloud-lightning';
  }

  return 'cloud-question';
}

function createOpenApiDocument(): Record<string, unknown> {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Weather API',
      version: '1.0.0',
      description: 'Public endpoints for location search, reverse geocoding and weather forecasts.',
    },
    paths: {
      '/api/v0/locations': {
        get: {
          summary: 'Search locations by city name.',
          parameters: [
            createQueryParameter('query', true, 'City name with at least 2 characters.'),
            createQueryParameter('language', false, 'Response language, defaults to pt.'),
          ],
          responses: createStandardResponses('Location list response.'),
        },
      },
      '/api/v0/locations/reverse': {
        get: {
          summary: 'Suggest a location from coordinates.',
          parameters: [
            createQueryParameter('latitude', true, 'Latitude between -90 and 90.'),
            createQueryParameter('longitude', true, 'Longitude between -180 and 180.'),
          ],
          responses: createStandardResponses('Location suggestion response.'),
        },
      },
      '/api/v0/weather': {
        get: {
          summary: 'Get current weather and 7 day forecast.',
          parameters: [
            createQueryParameter('latitude', true, 'Latitude between -90 and 90.'),
            createQueryParameter('longitude', true, 'Longitude between -180 and 180.'),
            createQueryParameter('locationId', false, 'Optional selected location identifier.'),
            createQueryParameter('locationName', false, 'Optional selected location display name.'),
            createQueryParameter('admin1', false, 'Optional state or administrative region.'),
            createQueryParameter('country', false, 'Optional country name.'),
            createQueryParameter('countryCode', false, 'Optional ISO country code.'),
            createQueryParameter('timezone', false, 'Optional IANA timezone.'),
          ],
          responses: createStandardResponses('Weather panel response.'),
        },
      },
      '/api/v1/cities/search': {
        get: {
          summary: 'Search cities by name.',
          parameters: [
            createQueryParameter('q', true, 'City name with at least 2 characters.'),
            createQueryParameter('limit', false, 'Maximum number of cities returned.'),
            createQueryParameter('language', false, 'Response language, defaults to provider behavior.'),
          ],
          responses: createStandardResponses('City list response.'),
        },
      },
      '/api/v1/weather': {
        get: {
          summary: 'Get canonical current weather and 7 day forecast.',
          parameters: [
            createQueryParameter('lat', true, 'Latitude between -90 and 90.'),
            createQueryParameter('lon', true, 'Longitude between -180 and 180.'),
            createQueryParameter('cityId', false, 'Optional selected city identifier.'),
            createQueryParameter('cityName', false, 'Optional selected city name.'),
            createQueryParameter('region', false, 'Optional state or administrative region.'),
            createQueryParameter('country', false, 'Optional country name.'),
            createQueryParameter('countryCode', false, 'Optional ISO country code.'),
            createQueryParameter('timezone', false, 'Optional IANA timezone.'),
          ],
          responses: createStandardResponses('Canonical weather snapshot response.'),
        },
      },
    },
  };
}

function createQueryParameter(name: string, required: boolean, description: string): Record<string, unknown> {
  return {
    name,
    in: 'query',
    required,
    description,
    schema: {
      type: 'string',
    },
  };
}

function createStandardResponses(successDescription: string): Record<string, unknown> {
  return {
    200: {
      description: successDescription,
    },
    400: {
      description: 'Malformed input.',
    },
    404: {
      description: 'Resource not found.',
    },
    422: {
      description: 'Validation error.',
    },
    500: {
      description: 'Unexpected error.',
    },
    502: {
      description: 'External provider error.',
    },
  };
}
