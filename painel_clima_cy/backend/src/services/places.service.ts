import {
  OpenMeteoGeocodingClient,
  OpenMeteoGeocodingPlace
} from '../data/clients/open-meteo-geocoding.client';
import { PlaceNotFoundError, UpstreamWeatherError } from '../errors/domain-errors';
import { PlaceCandidate } from '../types/weather';

const MAX_PLACE_CANDIDATES = 5;

export interface PlacesServiceClient {
  search(input: { query: string; count: number }): Promise<OpenMeteoGeocodingPlace[]>;
  reverse(input: { latitude: number; longitude: number; count: number }): Promise<OpenMeteoGeocodingPlace[]>;
}

export class PlacesService {
  private readonly geocodingClient: PlacesServiceClient;

  constructor(geocodingClient: PlacesServiceClient = new OpenMeteoGeocodingClient()) {
    this.geocodingClient = geocodingClient;
  }

  async search(query: string, count = MAX_PLACE_CANDIDATES): Promise<PlaceCandidate[]> {
    const places = await this.geocodingClient.search({
      query,
      count: Math.min(count, MAX_PLACE_CANDIDATES)
    });

    return toPlaceCandidates(places);
  }

  async reverse(latitude: number, longitude: number): Promise<PlaceCandidate[]> {
    try {
      const places = await this.geocodingClient.reverse({
        latitude,
        longitude,
        count: MAX_PLACE_CANDIDATES
      });

      return toPlaceCandidates(places);
    } catch (error) {
      if (error instanceof PlaceNotFoundError || error instanceof UpstreamWeatherError) {
        return [toCoordinatePlaceCandidate(latitude, longitude)];
      }

      throw error;
    }
  }
}

const toPlaceCandidates = (places: OpenMeteoGeocodingPlace[]): PlaceCandidate[] => {
  const candidates = places.slice(0, MAX_PLACE_CANDIDATES).map(toPlaceCandidate);

  if (candidates.length === 0) {
    throw new PlaceNotFoundError();
  }

  return candidates;
};

const toPlaceCandidate = (place: OpenMeteoGeocodingPlace): PlaceCandidate => {
  const label = [place.name, place.admin1, place.country]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(', ');

  return {
    id: place.id,
    name: place.name,
    admin1: place.admin1,
    country: place.country,
    latitude: place.latitude,
    longitude: place.longitude,
    label
  };
};

const toCoordinatePlaceCandidate = (latitude: number, longitude: number): PlaceCandidate => {
  const formattedLatitude = latitude.toFixed(2);
  const formattedLongitude = longitude.toFixed(2);

  return {
    id: `coordinates-${formattedLatitude}-${formattedLongitude}`,
    name: 'Local atual',
    country: 'Coordenadas informadas',
    latitude,
    longitude,
    label: `Local atual (${formattedLatitude}, ${formattedLongitude})`
  };
};
