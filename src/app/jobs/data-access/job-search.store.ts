import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { declareExperimentalWebMcpTool } from '@angular/core';
import { JobOffer, MapBounds } from '../../shared/models/job.types';
import { JobSearchCriteria } from '../../shared/models/search.types';
import { matchesSearchCriteria } from '../../shared/utils/job.utils';
import { toolJson } from '../../webmcp/utils/tool-response';
import { JobRepository } from './job.repository';

const SEARCH_JOBS_SCHEMA = {
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
        enum: ['junior', 'mid', 'senior', 'lead', 'staff'],
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

@Injectable({ providedIn: 'root' })
export class JobSearchStore {
  private readonly jobRepository = inject(JobRepository);

  readonly criteria = signal<JobSearchCriteria>({});
  readonly allJobs = signal<JobOffer[]>([]);
  readonly selectedJobId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly mapBounds = signal<MapBounds | null>(null);

  readonly jobs = computed(() => {
    const criteria = this.criteria();
    return this.allJobs().filter((job) => matchesSearchCriteria(job, criteria));
  });

  constructor() {
    void declareExperimentalWebMcpTool({
      name: 'search_jobs',
      description:
        'Search job offers and update filters, list, and map in real time. Use this for natural-language job search intent.',
      inputSchema: SEARCH_JOBS_SCHEMA,
      execute: (input) => {
        this.applyCriteria(input);
        return toolJson({
          criteria: this.criteria(),
          resultCount: this.jobs().length,
          jobIds: this.jobs().slice(0, 10).map((job) => job.id),
        });
      },
    });

    effect(() => {
      const selectedId = this.selectedJobId();
      if (!selectedId) {
        return;
      }
      const exists = this.jobs().some((job) => job.id === selectedId);
      if (!exists) {
        this.selectedJobId.set(null);
      }
    });
  }

  async loadJobs(): Promise<void> {
    this.loading.set(true);
    try {
      const jobs = await this.jobRepository.getAllJobs();
      this.allJobs.set(jobs);
    } finally {
      this.loading.set(false);
    }
  }

  applyCriteria(partial: JobSearchCriteria): void {
    this.criteria.set({ ...this.criteria(), ...partial });
  }

  patchCriteria(partial: Partial<JobSearchCriteria>): void {
    this.criteria.update((current) => ({ ...current, ...partial }));
  }

  clearCriteria(): void {
    this.criteria.set({});
  }

  selectJob(jobId: string | null): void {
    this.selectedJobId.set(jobId);
  }
}
