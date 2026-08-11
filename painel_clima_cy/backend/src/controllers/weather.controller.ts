import { Router, Request, Response } from 'express';
import { WeatherService } from '../services/weather.service';
import { WeatherPanelPayload } from '../types/weather';
import { readCoordinateQuery, readTemperatureUnit } from './query-validation';

export const createWeatherRouter = (weatherService: WeatherService = new WeatherService()): Router => {
  const router = Router();

  router.get('/', async (req: Request, res: Response<WeatherPanelPayload>) => {
    const latitude = readCoordinateQuery(req.query.latitude, 'latitude', -90, 90);
    const longitude = readCoordinateQuery(req.query.longitude, 'longitude', -180, 180);
    const temperatureUnit = readTemperatureUnit(req.query.temperatureUnit);
    const weather = await weatherService.getWeather({ latitude, longitude, temperatureUnit });

    res.status(200).json(weather);
  });

  return router;
};
