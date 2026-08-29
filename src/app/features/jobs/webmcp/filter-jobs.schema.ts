export const FILTER_JOBS_SCHEMA = {
  type: 'object',
  properties: {
    roles: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Role title keywords. A job matches when its title contains any listed role (OR). Pass [] to clear.',
    },
    skills: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Skill names. A job matches when it lists any listed skill (OR). Pass [] to clear.',
    },
    seniority: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['junior', 'regular', 'senior', 'expert'],
      },
      description: 'Seniority levels. A job matches any listed level (OR). Pass [] to clear.',
    },
    workSchedules: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['full-time', 'part-time', 'freelance'],
      },
      description: 'Work schedules. A job matches any listed schedule (OR). Pass [] to clear.',
    },
    workplace: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['remote', 'hybrid', 'onsite'],
      },
      description: 'Workplace modes. A job matches any listed mode (OR). Pass [] to clear.',
    },
    contracts: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['b2b', 'employment', 'service-contract', 'internship'],
      },
      description: 'Contract types. A job matches any listed type (OR). Pass [] to clear.',
    },
    salaryMin: {
      type: 'number',
      description:
        'Minimum monthly gross salary in USD. Only USD offers are compared; other currencies are excluded when this filter is set. Omit to clear.',
    },
    sort: {
      type: 'string',
      enum: ['newest', 'oldest', 'salary-desc', 'salary-asc', 'deadline', 'distance'],
      description:
        'Result ordering. distance requires a location from search_jobs. Pass newest to reset default ordering.',
    },
  },
  additionalProperties: false,
} as const;
