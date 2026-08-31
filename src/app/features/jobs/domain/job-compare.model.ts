import { JobOffer } from '@features/jobs/domain/job.model';

export interface JobCompareOfferInput {
  jobId: string;
  badge?: string;
  note?: string;
  highlighted?: boolean;
}

export interface JobCompareOfferView extends JobCompareOfferInput {
  job: JobOffer;
}

export interface JobComparePresentation {
  requestId: number;
  title: string;
  summary: string;
  offers: JobCompareOfferView[];
}

export interface JobCompareShowInput {
  title?: string;
  summary: string;
  offers: JobCompareOfferInput[];
}

export interface JobCompareShowResult {
  displayed: boolean;
  offerCount: number;
  missingJobIds: string[];
  offers: {
    jobId: string;
    badge?: string;
    note?: string;
    highlighted?: boolean;
    title: string;
    company: string;
    location?: string;
  }[];
}

export const DEFAULT_JOB_COMPARE_TITLE = 'Offer comparison';
