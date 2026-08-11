import { Router, Request, Response } from 'express';
import { PlacesService } from '../services/places.service';
import { InvalidQueryError } from '../errors/domain-errors';
import { PlaceCandidate } from '../types/weather';
import { readCoordinateQuery, readOptionalCount, readStringQuery } from './query-validation';

interface PlacesResponseBody {
  places: PlaceCandidate[];
}

export const createPlacesRouter = (placesService: PlacesService = new PlacesService()): Router => {
  const router = Router();

  router.get('/search', async (req: Request, res: Response<PlacesResponseBody>) => {
    const query = readStringQuery(req.query.q, 'q');

    if (query.length < 2) {
      throw new InvalidQueryError('Query parameter "q" must contain at least 2 characters', 400);
    }

    const places = await placesService.search(query, readOptionalCount(req.query.count));
    res.status(200).json({ places });
  });

  router.get('/reverse', async (req: Request, res: Response<PlacesResponseBody>) => {
    const latitude = readCoordinateQuery(req.query.latitude, 'latitude', -90, 90);
    const longitude = readCoordinateQuery(req.query.longitude, 'longitude', -180, 180);
    const places = await placesService.reverse(latitude, longitude);

    res.status(200).json({ places });
  });

  return router;
};
