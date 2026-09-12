import { z } from 'zod';
import {
  DEFAULT_SEARCH_RADIUS_MI,
  SEARCH_RADIUS_OPTIONS_MI,
} from '../../../domain/header-search.model';

export const SEARCH_JOBS_DEFAULT_LIMIT = 10;
export const SEARCH_JOBS_MAX_LIMIT = 20;
export const SEARCH_JOBS_MAX_SALARY_MIN_USD = 1_000_000;

const keywordList = (description: string) =>
  z
    .array(z.string().trim().min(1).max(100))
    .max(20)
    .optional()
    .meta({ description, uniqueItems: true });

export const SEARCH_JOBS_INPUT_SCHEMA = z
  .strictObject({
    query: z.string().trim().max(200).optional().meta({
      description: 'Free-text match against title, company, description, and skills.',
    }),
    location: z.string().trim().min(1).max(100).optional().meta({
      description: 'City name used as the geographic search center.',
    }),
    radiusMi: z
      .literal(SEARCH_RADIUS_OPTIONS_MI)
      .optional()
      .meta({
        description: `Search radius in miles around location. Enum: ${SEARCH_RADIUS_OPTIONS_MI.join(', ')}. Default ${DEFAULT_SEARCH_RADIUS_MI} when location is set.`,
      }),
    roles: keywordList('Role-title keywords matched with OR.'),
    skills: keywordList('Skill names matched with OR.'),
    seniority: z
      .array(z.enum(['junior', 'regular', 'senior', 'expert']))
      .max(4)
      .optional()
      .meta({ description: 'Seniority levels matched with OR.', uniqueItems: true }),
    workSchedules: z
      .array(z.enum(['full-time', 'part-time', 'freelance']))
      .max(3)
      .optional()
      .meta({ description: 'Work schedules matched with OR.', uniqueItems: true }),
    workplace: z
      .array(z.enum(['remote', 'hybrid', 'onsite']))
      .max(3)
      .optional()
      .meta({ description: 'Workplace modes matched with OR.', uniqueItems: true }),
    contracts: z
      .array(z.enum(['b2b', 'employment', 'service-contract', 'internship']))
      .max(4)
      .optional()
      .meta({ description: 'Contract types matched with OR.', uniqueItems: true }),
    salaryMinUsd: z
      .number()
      .finite()
      .int()
      .nonnegative()
      .max(SEARCH_JOBS_MAX_SALARY_MIN_USD)
      .optional()
      .meta({
        description:
          "Minimum monthly gross salary in USD. Compared against each offer's max salary amount.",
      }),
    sort: z
      .enum(['newest', 'oldest', 'salary-desc', 'salary-asc', 'deadline', 'distance'])
      .default('newest')
      .meta({ description: 'Result ordering. Default: newest.' }),
    limit: z
      .number()
      .int()
      .min(1)
      .max(SEARCH_JOBS_MAX_LIMIT)
      .default(SEARCH_JOBS_DEFAULT_LIMIT)
      .meta({
        description: `Max lightweight results to return (1–${SEARCH_JOBS_MAX_LIMIT}). Default: ${SEARCH_JOBS_DEFAULT_LIMIT}.`,
      }),
  })
  .superRefine((input, context) => {
    if (input.radiusMi != null && !input.location) {
      context.addIssue({
        code: 'custom',
        path: ['radiusMi'],
        message: 'radiusMi requires one location.',
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
