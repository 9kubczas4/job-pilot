import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { JobOffer, MapBounds } from '../domain/job.model';
import { matchesSearchCriteria } from '../domain/job-matcher';
import { searchCriteriaFieldsEqual } from '../domain/search-url.utils';
import { JobSearchCriteria } from '../domain/search.model';
import { JobRepository } from '../data-access/job.repository';

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
    this.criteria.update((current) => mergeDefinedCriteria(current, partial));
  }

  applyRouteSearchCriteria(
    partial: Pick<
      JobSearchCriteria,
      'query' | 'locations' | 'locationLat' | 'locationLng' | 'radiusKm'
    >,
  ): void {
    this.criteria.update((current) => {
      const next = {
        ...current,
        query: partial.query,
        locations: partial.locations,
        locationLat: partial.locationLat,
        locationLng: partial.locationLng,
        radiusKm: partial.radiusKm,
      };

      return searchCriteriaFieldsEqual(current, next) ? current : next;
    });
  }

  patchSearchCriteria(
    partial: Pick<
      JobSearchCriteria,
      'query' | 'locations' | 'locationLat' | 'locationLng' | 'radiusKm'
    >,
  ): void {
    this.criteria.update((current) => {
      const next = { ...current, ...partial };
      return searchCriteriaFieldsEqual(current, next) ? current : next;
    });
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

function mergeDefinedCriteria(
  current: JobSearchCriteria,
  partial: JobSearchCriteria,
): JobSearchCriteria {
  const next: JobSearchCriteria = { ...current };

  for (const [key, value] of Object.entries(partial) as [
    keyof JobSearchCriteria,
    JobSearchCriteria[keyof JobSearchCriteria],
  ][]) {
    if (value !== undefined) {
      next[key] = value as never;
    }
  }

  return next;
}
