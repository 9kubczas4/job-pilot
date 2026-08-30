import { JobOffer } from '@features/jobs/domain/job.model';
import { JOB_VIRTUAL_SCROLL_LOADING_PLACEHOLDER_COUNT } from './job-virtual-scroll.constants';

const LOADING_PLACEHOLDER_JOB_TEMPLATE: Omit<JobOffer, 'id'> = {
  title: '',
  company: { id: '__loading__', name: '' },
  description: '',
  seniority: ['regular'],
  competencies: [],
  workSchedules: ['full-time'],
  contractTypes: ['employment'],
  workplace: 'hybrid',
  responsibilities: [],
  requirements: [],
  createdAt: '1970-01-01T00:00:00.000Z',
};

export const JOB_VIRTUAL_SCROLL_LOADING_JOBS: readonly JobOffer[] = Object.freeze(
  Array.from({ length: JOB_VIRTUAL_SCROLL_LOADING_PLACEHOLDER_COUNT }, (_, index) => ({
    ...LOADING_PLACEHOLDER_JOB_TEMPLATE,
    id: `__job-loading-${index}`,
  })),
);
