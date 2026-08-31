import { inject, Injectable } from '@angular/core';
import { AppLinks } from '@core/app-paths';
import { haversineDistanceKm } from '@features/jobs/domain/geo.utils';
import { DEFAULT_SEARCH_RADIUS_KM } from '@features/jobs/domain/header-search.model';
import { JobOffer } from '@features/jobs/domain/job.model';
import {
  JobSearchResultSummary,
  JobSearchToolResult,
} from './job-search-tool-result.model';
import { HeaderSearchPageSupport } from '@features/jobs/state/header-search-page.support';
import { JobSearchAiActivity } from '@features/jobs/state/header-ui.store';
import { buildCityCentersFromJobs, resolveCityCenter } from '@features/jobs/domain/city-catalog';
import {
  enrichLocationCriteria,
  searchLocationEqual,
} from '@features/jobs/domain/job-search-sync.utils';
import { JobSearchCriteria } from '@features/jobs/domain/search.model';
import { JobSearchStore } from '@features/jobs/state/job-search.store';
import { routeCriteriaEqual } from '@features/jobs/domain/search-url.utils';
import {
  filterControlFieldsChanged,
  JobSearchInput,
  sortFieldChanged,
} from './webmcp-criteria.utils';

@Injectable({ providedIn: 'root' })
export class JobSearchWebMcpService {
  private readonly store = inject(JobSearchStore);
  private readonly headerSearch = inject(HeaderSearchPageSupport);

  async applySearchCriteria(input: JobSearchInput): Promise<JobSearchToolResult> {
    let finishActivity: () => void = () => undefined;

    try {
      await this.store.loadJobs();

      const before = this.store.criteria();
      this.store.setCriteriaFromRoute(this.normalizeCompleteCriteria(input));
      const after = this.store.criteria();

      finishActivity = this.headerSearch.headerUi.beginAiToolActivity([
        ...changedSearchControls(before, after),
        ...(filterControlFieldsChanged(before, after) ? (['filters'] as const) : []),
        ...(sortFieldChanged(before, after) ? (['sort'] as const) : []),
      ]);

      return await this.syncUiAndNavigate(
        () => !routeCriteriaEqual(before, this.store.criteria()),
        input.limit,
      );
    } finally {
      finishActivity();
    }
  }

  private async syncUiAndNavigate(
    changed: () => boolean,
    resultLimit = 10,
  ): Promise<JobSearchToolResult> {
    this.enrichStoredLocationIfNeeded();
    await this.headerSearch.submitCriteria(this.store.criteria(), AppLinks.jobs);

    const criteria = this.store.criteria();
    const jobs = this.store.jobs().slice(0, resultLimit);

    return {
      success: true,
      changed: changed(),
      criteria,
      resultCount: this.store.jobs().length,
      jobIds: jobs.map((job) => job.id),
      results: jobs.map((job) => toJobSearchResultSummary(job, criteria)),
    };
  }

  private normalizeCompleteCriteria(input: JobSearchInput): JobSearchCriteria {
    const location = input.location?.trim() || undefined;
    const city = location
      ? resolveCityCenter(buildCityCentersFromJobs(this.store.allJobs()), location)
      : null;

    return {
      query: input.query?.trim() || undefined,
      roles: normalizeList(input.roles),
      skills: normalizeList(input.skills),
      seniority: normalizeList(input.seniority),
      workSchedules: normalizeList(input.workSchedules),
      workplace: normalizeList(input.workplace),
      contracts: normalizeList(input.contracts),
      salaryMin: input.salaryMin || undefined,
      locations: location ? [location] : undefined,
      locationLat: city?.latitude,
      locationLng: city?.longitude,
      radiusKm: location ? (input.radiusKm ?? DEFAULT_SEARCH_RADIUS_KM) : undefined,
      sort: input.sort === 'newest' ? undefined : input.sort,
    };
  }

  private enrichStoredLocationIfNeeded(): void {
    const criteria = this.store.criteria();
    const jobs = this.store.allJobs();
    if (!jobs.length) {
      return;
    }

    const enriched = enrichLocationCriteria(criteria, jobs);
    if (searchLocationEqual(criteria, enriched)) {
      return;
    }

    this.store.patchSearchCriteria({
      locationLat: enriched.locationLat,
      locationLng: enriched.locationLng,
      radiusKm: enriched.radiusKm,
    });
  }
}

function normalizeList<T>(values: T[] | undefined): T[] | undefined {
  return values?.length ? values : undefined;
}

function toJobSearchResultSummary(
  job: JobOffer,
  criteria: JobSearchCriteria,
): JobSearchResultSummary {
  const distanceKm = jobDistanceKm(job, criteria);

  return {
    id: job.id,
    title: job.title,
    company: job.company.name,
    ...(job.location ? { location: job.location.city } : {}),
    ...(distanceKm == null ? {} : { distanceKm }),
    workplace: job.workplace,
    ...(job.salary ? { salary: { ...job.salary } } : {}),
    seniority: [...job.seniority],
    skills: job.competencies.map((competency) => competency.name),
  };
}

function jobDistanceKm(job: JobOffer, criteria: JobSearchCriteria): number | undefined {
  if (
    criteria.locationLat == null ||
    criteria.locationLng == null ||
    !job.location
  ) {
    return undefined;
  }

  const distance = haversineDistanceKm(
    criteria.locationLat,
    criteria.locationLng,
    job.location.latitude,
    job.location.longitude,
  );
  return Math.round(distance * 10) / 10;
}

function changedSearchControls(
  before: JobSearchCriteria,
  after: JobSearchCriteria,
): JobSearchAiActivity[] {
  const controls: JobSearchAiActivity[] = [];

  if ((before.query ?? '').trim() !== (after.query ?? '').trim()) {
    controls.push('query');
  }
  if ((before.locations?.[0] ?? '').trim() !== (after.locations?.[0] ?? '').trim()) {
    controls.push('location');
  }
  if (displayRadius(before) !== displayRadius(after)) {
    controls.push('radius');
  }

  return controls;
}

function displayRadius(criteria: JobSearchCriteria): number {
  return criteria.radiusKm ?? DEFAULT_SEARCH_RADIUS_KM;
}
