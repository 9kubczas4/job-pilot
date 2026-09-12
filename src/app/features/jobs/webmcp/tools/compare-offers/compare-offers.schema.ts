import { z } from 'zod';

const COMPARE_OFFERS_ENTRY_SCHEMA = z.strictObject({
  jobId: z.string().trim().min(1).max(128).meta({
    description: 'Job ID from search_jobs, get_jobs, or get_saved_jobs.',
  }),
  badge: z.string().trim().min(1).max(64).optional().meta({
    description: 'Optional short label for this offer (1–64 chars).',
  }),
  note: z.string().trim().max(500).optional().meta({
    description: 'Optional rationale for this offer (max 500 chars).',
  }),
  highlighted: z.boolean().optional().meta({
    description: 'When true, mark this offer as the primary pick. At most one may be true.',
  }),
});

export const COMPARE_OFFERS_INPUT_SCHEMA = z.strictObject({
  title: z.string().trim().min(1).max(120).optional().meta({
    description: 'Optional drawer heading (1–120 chars). Default: "Offer comparison".',
  }),
  summary: z.string().trim().min(1).max(2000).meta({
    description: 'Overall analysis shown above the comparison (1–2000 chars).',
  }),
  offers: z
    .array(COMPARE_OFFERS_ENTRY_SCHEMA)
    .min(2)
    .max(5)
    .refine((offers) => new Set(offers.map((offer) => offer.jobId)).size === offers.length, {
      message: 'Each jobId may appear only once in offers.',
    })
    .refine((offers) => offers.filter((offer) => offer.highlighted).length <= 1, {
      message: 'At most one offer may be highlighted.',
    })
    .meta({
      description: 'Two to five offers to compare, each with a jobId and optional badge/note.',
    }),
});

export type CompareOffersInput = z.output<typeof COMPARE_OFFERS_INPUT_SCHEMA>;
