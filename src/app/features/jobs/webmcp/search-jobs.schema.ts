export const SEARCH_JOBS_SCHEMA = {
  type: 'object',
  properties: {
    query: { type: 'string', description: 'Free-text search across title, company, skills.' },
    roles: {
      type: 'array',
      items: { type: 'string' },
      description: 'Preferred role titles.',
    },
    skills: {
      type: 'array',
      items: { type: 'string' },
      description: 'Required skills.',
    },
    seniority: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['junior', 'regular', 'senior', 'expert'],
      },
    },
    workSchedules: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['full-time', 'part-time', 'freelance'],
      },
    },
    locations: {
      type: 'array',
      items: { type: 'string' },
      description: 'City names such as Warsaw or Krakow.',
    },
    workplace: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['remote', 'hybrid', 'onsite'],
      },
    },
    contracts: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['b2b', 'uop', 'uz', 'internship'],
      },
    },
    salaryMin: { type: 'number', description: 'Minimum salary in the job currency.' },
    radiusKm: { type: 'number' },
  },
  additionalProperties: false,
} as const;
