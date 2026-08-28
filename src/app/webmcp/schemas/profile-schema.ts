export const PROFILE_SCHEMA_FIELDS = {
  firstName: { type: 'string', required: false },
  lastName: { type: 'string', required: false },
  headline: { type: 'string', required: false },
  yearsOfExperience: { type: 'number', required: false },
  skills: { type: 'array', items: { name: 'string', years: 'number' }, required: false },
  preferredRoles: { type: 'array', items: 'string', required: false },
  preferredSeniorities: {
    type: 'array',
    allowed: ['junior', 'mid', 'senior', 'lead', 'staff'],
    required: false,
  },
  preferredLocations: { type: 'array', items: 'string', required: false },
  workplacePreferences: {
    type: 'array',
    allowed: ['remote', 'hybrid', 'onsite'],
    required: false,
  },
  contractPreferences: {
    type: 'array',
    allowed: ['b2b', 'uop', 'uz', 'internship'],
    required: false,
  },
  salaryExpectation: {
    type: 'object',
    properties: { min: 'number', currency: ['PLN', 'EUR', 'USD'] },
    required: false,
  },
  preferences: { type: 'string', required: false },
} as const;

export function getProfileSchemaPayload() {
  return { fields: PROFILE_SCHEMA_FIELDS };
}
