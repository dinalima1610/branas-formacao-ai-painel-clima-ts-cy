import { z } from 'zod';

const queryStringSchema = z.preprocess(readQueryValue, z.string());
const optionalQueryStringSchema = z.preprocess(readQueryValue, z.string().optional());
const optionalLimitSchema = optionalQueryStringSchema
  .transform((value, context) => {
    if (value === undefined) {
      return undefined;
    }

    const limit = Number(value);

    if (!Number.isInteger(limit) || limit < 1) {
      context.addIssue({
        code: 'custom',
        message: 'Limit must be a positive integer.',
      });
      return z.NEVER;
    }

    return limit;
  });
const coordinateSchema = queryStringSchema
  .refine((value) => value.trim().length > 0)
  .transform((value) => Number(value))
  .pipe(z.number().finite());

export const citySearchQuerySchema = z.object({
  language: optionalQueryStringSchema,
  limit: optionalLimitSchema,
  q: optionalQueryStringSchema,
  query: optionalQueryStringSchema,
}).transform((query) => ({
  language: query.language,
  limit: query.limit,
  query: query.q ?? query.query ?? '',
}));

export const weatherQuerySchema = z.object({
  city: optionalQueryStringSchema,
  cityId: optionalQueryStringSchema,
  cityName: optionalQueryStringSchema,
  country: optionalQueryStringSchema,
  countryCode: optionalQueryStringSchema,
  lat: coordinateSchema,
  lon: coordinateSchema,
  region: optionalQueryStringSchema,
  timezone: optionalQueryStringSchema,
});

export type CitySearchQuery = z.infer<typeof citySearchQuerySchema>;
export type WeatherQuery = z.infer<typeof weatherQuerySchema>;

function readQueryValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
