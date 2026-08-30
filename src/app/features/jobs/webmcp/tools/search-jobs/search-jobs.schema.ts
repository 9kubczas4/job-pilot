import { z } from 'zod';
import {
  DEFAULT_SEARCH_RADIUS_KM,
  SEARCH_RADIUS_OPTIONS_KM,
} from '../../../domain/header-search.model';

export const SEARCH_JOBS_INPUT_SCHEMA = z
  .strictObject({
    query: z.string().trim().max(200).optional().meta({
      description:
        'Free-text query matched against job title, company, description, and skills. Omit or pass an empty string to clear the current query.',
    }),
    locations: z.array(z.string().trim().min(1).max(100)).max(1).optional().meta({
      description:
        'Zero or one city name used as the geographic search center (for example, Warsaw). Omit or pass [] to clear the current location.',
    }),
    radiusKm: z
      .literal(SEARCH_RADIUS_OPTIONS_KM)
      .optional()
      .meta({
        description: `Search radius in kilometers around locations[0]. Allowed values: ${SEARCH_RADIUS_OPTIONS_KM.join(', ')}. Omit to use ${DEFAULT_SEARCH_RADIUS_KM} km when a location is provided.`,
      }),
  })
  .superRefine((input, context) => {
    if (input.radiusKm != null && !input.locations?.length) {
      context.addIssue({
        code: 'custom',
        path: ['radiusKm'],
        message: 'radiusKm requires one location.',
      });
    }
  });
