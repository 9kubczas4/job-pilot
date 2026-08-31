import { z } from 'zod';
import {
  DEFAULT_SEARCH_RADIUS_KM,
  SEARCH_RADIUS_OPTIONS_KM,
} from '../../../domain/header-search.model';

const keywordList = (description: string) =>
  z
    .array(z.string().trim().min(1).max(100))
    .max(20)
    .optional()
    .meta({ description });

export const SEARCH_JOBS_INPUT_SCHEMA = z
  .strictObject({
    query: z.string().trim().max(200).optional().meta({
      description: 'Text matched against job title, company, description, and skills.',
    }),
    location: z.string().trim().min(1).max(100).optional().meta({
      description: 'City used as the geographic search center.',
    }),
    radiusKm: z
      .literal(SEARCH_RADIUS_OPTIONS_KM)
      .optional()
      .meta({
        description: `Search radius in kilometers around location. Allowed values: ${SEARCH_RADIUS_OPTIONS_KM.join(', ')}. Omit to use ${DEFAULT_SEARCH_RADIUS_KM} km when a location is provided.`,
      }),
    roles: keywordList('Role-title keywords matched with OR.'),
    skills: keywordList('Skill names matched with OR.'),
    seniority: z
      .array(z.enum(['junior', 'regular', 'senior', 'expert']))
      .max(4)
      .optional()
      .meta({ description: 'Seniority levels matched with OR.' }),
    workSchedules: z
      .array(z.enum(['full-time', 'part-time', 'freelance']))
      .max(3)
      .optional()
      .meta({ description: 'Work schedules matched with OR.' }),
    workplace: z
      .array(z.enum(['remote', 'hybrid', 'onsite']))
      .max(3)
      .optional()
      .meta({ description: 'Workplace modes matched with OR.' }),
    contracts: z
      .array(z.enum(['b2b', 'employment', 'service-contract', 'internship']))
      .max(4)
      .optional()
      .meta({ description: 'Contract types matched with OR.' }),
    salaryMin: z.number().finite().nonnegative().optional().meta({
      description: 'Minimum acceptable monthly gross salary in USD.',
    }),
    sort: z
      .enum(['newest', 'oldest', 'salary-desc', 'salary-asc', 'deadline', 'distance'])
      .optional()
      .meta({ description: 'Result ordering. Defaults to newest.' }),
    limit: z.number().int().min(1).max(20).optional().meta({
      description: 'Maximum number of lightweight results to return.',
    }),
  })
  .superRefine((input, context) => {
    if (input.radiusKm != null && !input.location) {
      context.addIssue({
        code: 'custom',
        path: ['radiusKm'],
        message: 'radiusKm requires one location.',
      });
    }
    if (input.sort === 'distance' && !input.location) {
      context.addIssue({
        code: 'custom',
        path: ['sort'],
        message: 'distance sorting requires one location.',
      });
    }
  });
