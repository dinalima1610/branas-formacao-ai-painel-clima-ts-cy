import {
  ForecastClientInput,
  OpenMeteoForecastClient,
  OpenMeteoForecastResponse
} from '../data/clients/open-meteo-forecast.client';
import { getWeatherCondition } from '../data/weather-code-labels.pt';
import { InvalidQueryError } from '../errors/domain-errors';
import {
  DailyForecastSlot,
  HourlyForecastSlot,
  PlaceCandidate,
  TemperatureUnit,
  WeatherPanelPayload,
  WeatherQuery,
  WindSpeedUnit
} from '../types/weather';
import { PlacesService } from './places.service';

export interface ForecastServiceClient {
  getForecast(input: ForecastClientInput): Promise<OpenMeteoForecastResponse>;
}

export class WeatherService {
  private readonly forecastClient: ForecastServiceClient;
  private readonly placesService: Pick<PlacesService, 'reverse'>;

  constructor(
    forecastClient: ForecastServiceClient = new OpenMeteoForecastClient(),
    placesService: Pick<PlacesService, 'reverse'> = new PlacesService()
  ) {
    this.forecastClient = forecastClient;
    this.placesService = placesService;
  }

  async getWeather(query: WeatherQuery): Promise<WeatherPanelPayload> {
    const windSpeedUnit = getWindSpeedUnit(query.temperatureUnit);
    const [places, forecast] = await Promise.all([
      this.placesService.reverse(query.latitude, query.longitude),
      this.forecastClient.getForecast({
        latitude: query.latitude,
        longitude: query.longitude,
        temperatureUnit: query.temperatureUnit,
        windSpeedUnit
      })
    ]);

    return mapWeatherPayload(query.temperatureUnit, windSpeedUnit, places[0], forecast);
  }
}

const getWindSpeedUnit = (temperatureUnit: TemperatureUnit): WindSpeedUnit => {
  return temperatureUnit === 'celsius' ? 'kmh' : 'mph';
};

const mapWeatherPayload = (
  temperatureUnit: TemperatureUnit,
  windSpeedUnit: WindSpeedUnit,
  place: PlaceCandidate,
  forecast: OpenMeteoForecastResponse
): WeatherPanelPayload => {
  const condition = getWeatherCondition(forecast.current.weatherCode);

  return {
    place,
    current: {
      temperature: forecast.current.temperature,
      apparentTemperature: forecast.current.apparentTemperature,
      humidity: forecast.current.humidity,
      windSpeed: forecast.current.windSpeed,
      windSpeedUnit,
      weatherCode: forecast.current.weatherCode,
      conditionLabel: condition.label,
      conditionIconKey: condition.iconKey,
      isDay: forecast.current.isDay
    },
    hourly: mapHourly(forecast),
    daily: mapDaily(forecast),
    meta: {
      fetchedAt: new Date().toISOString(),
      temperatureUnit
    }
  };
};

const mapHourly = (forecast: OpenMeteoForecastResponse): HourlyForecastSlot[] => {
  const slots = forecast.hourly.time.slice(0, 24).map((time, index) => {
    const weatherCode = forecast.hourly.weatherCode[index];
    const condition = getWeatherCondition(weatherCode);

    return {
      time,
      temperature: forecast.hourly.temperature[index],
      weatherCode,
      conditionLabel: condition.label,
      conditionIconKey: condition.iconKey
    };
  });

  if (slots.length !== 24 || slots.some((slot) => !Number.isFinite(slot.temperature))) {
    throw new InvalidQueryError('Forecast hourly data is incomplete');
  }

  return slots;
};

const mapDaily = (forecast: OpenMeteoForecastResponse): DailyForecastSlot[] => {
  const slots = forecast.daily.date.slice(0, 5).map((date, index) => {
    const weatherCode = forecast.daily.weatherCode[index];
    const condition = getWeatherCondition(weatherCode);

    return {
      date,
      temperatureMin: forecast.daily.temperatureMin[index],
      temperatureMax: forecast.daily.temperatureMax[index],
      weatherCode,
      conditionLabel: condition.label,
      conditionIconKey: condition.iconKey
    };
  });

  if (
    slots.length < 3 ||
    slots.length > 5 ||
    slots.some((slot) => !Number.isFinite(slot.temperatureMin) || !Number.isFinite(slot.temperatureMax))
  ) {
    throw new InvalidQueryError('Forecast daily data is incomplete');
  }

  return slots;
};
