import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { JobOffer, MapBounds } from '../domain/job.model';
import { matchesSearchCriteria } from '../domain/job-matcher';
import { sortJobs } from '../domain/job-sort.utils';
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
    const filtered = this.allJobs().filter((job) => matchesSearchCriteria(job, criteria));
    return sortJobs(filtered, criteria.sort, criteria);
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
    if (this.allJobs().length) {
      return;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loading.set(true);
    this.loadPromise = this.jobRepository
      .getAllJobs()
      .then((jobs) => {
        this.allJobs.set(jobs);
      })
      .finally(() => {
        this.loading.set(false);
        this.loadPromise = null;
      });

    return this.loadPromise;
  }

  private loadPromise: Promise<void> | null = null;

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

  setCriteriaFromRoute(route: JobSearchCriteria): void {
    this.criteria.set({
      query: route.query,
      locations: route.locations,
      locationLat: route.locationLat,
      locationLng: route.locationLng,
      radiusKm: route.radiusKm,
      workplace: route.workplace,
      seniority: route.seniority,
      skills: route.skills,
      contracts: route.contracts,
      workSchedules: route.workSchedules,
      salaryMin: route.salaryMin,
      sort: route.sort,
    });
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
