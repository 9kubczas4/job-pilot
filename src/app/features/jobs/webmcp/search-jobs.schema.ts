import {
  DEFAULT_SEARCH_RADIUS_KM,
  SEARCH_RADIUS_OPTIONS_KM,
} from '@shared/models/header-search.model';

export const SEARCH_JOBS_SCHEMA = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description:
        'Free-text search across title, company, description, and skills. Omit or pass an empty string to clear.',
    },
    locations: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 1,
      description:
        'Exactly one city name used as the geographic search center (for example Warsaw). Extra entries are ignored. Omit to clear location search.',
    },
    radiusKm: {
      type: 'number',
      enum: [...SEARCH_RADIUS_OPTIONS_KM],
      description: `Search radius in kilometers around the city center. Defaults to ${DEFAULT_SEARCH_RADIUS_KM} when a location is set. Requires locations.`,
    },
  },
  additionalProperties: false,
} as const;
