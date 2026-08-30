import { inject, Injectable } from '@angular/core';
import { AppLinks } from '@core/app-paths';
import { DEFAULT_SEARCH_RADIUS_KM } from '@features/jobs/domain/header-search.model';
import { JobSearchToolResult } from './job-search-tool-result.model';
import { HeaderSearchPageSupport } from '@features/jobs/state/header-search-page.support';
import { JobSearchAiActivity } from '@features/jobs/state/header-ui.store';
import { buildCityCentersFromJobs, resolveCityCenter } from '@features/jobs/domain/city-catalog';
import {
  enrichLocationCriteria,
  searchLocationEqual,
} from '@features/jobs/domain/job-search-sync.utils';
import { JobFilterCriteria, JobSearchCriteria } from '@features/jobs/domain/search.model';
import { JobSearchStore } from '@features/jobs/state/job-search.store';
import {
  filterFieldsChanged,
  filterControlFieldsChanged,
  JobSearchInput,
  normalizeFilterPatch,
  searchFieldsChanged,
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
      const location = input.locations?.[0]?.trim();
      let locationLat = input.locationLat;
      let locationLng = input.locationLng;
      let radiusKm = input.radiusKm;

      if (location) {
        if (radiusKm == null) {
          radiusKm = DEFAULT_SEARCH_RADIUS_KM;
        }

        if (locationLat == null || locationLng == null) {
          const city = resolveCityCenter(buildCityCentersFromJobs(this.store.allJobs()), location);
          if (city) {
            locationLat = city.latitude;
            locationLng = city.longitude;
          }
        }
      } else {
        locationLat = undefined;
        locationLng = undefined;
        radiusKm = undefined;
      }

      this.store.applyRouteSearchCriteria({
        query: input.query?.trim() || undefined,
        locations: location ? [location] : undefined,
        locationLat,
        locationLng,
        radiusKm: location ? radiusKm : undefined,
      });

      finishActivity = this.headerSearch.headerUi.beginAiToolActivity(
        changedSearchControls(before, this.store.criteria()),
      );

      return await this.syncUiAndNavigate(() =>
        searchFieldsChanged(before, this.store.criteria()),
      );
    } finally {
      finishActivity();
    }
  }

  async applyFilterCriteria(input: JobFilterCriteria): Promise<JobSearchToolResult> {
    let finishActivity: () => void = () => undefined;

    try {
      await this.store.loadJobs();

      const before = this.store.criteria();
      this.store.patchCriteria(normalizeFilterPatch(input));
      const after = this.store.criteria();

      finishActivity = this.headerSearch.headerUi.beginAiToolActivity([
        ...(filterControlFieldsChanged(before, after) ? (['filters'] as const) : []),
        ...(sortFieldChanged(before, after) ? (['sort'] as const) : []),
      ]);

      return await this.syncUiAndNavigate(() =>
        filterFieldsChanged(before, this.store.criteria()),
      );
    } finally {
      finishActivity();
    }
  }

  private async syncUiAndNavigate(changed: () => boolean): Promise<JobSearchToolResult> {
    this.enrichStoredLocationIfNeeded();
    await this.headerSearch.submitCriteria(this.store.criteria(), AppLinks.jobs);

    return {
      success: true,
      changed: changed(),
      criteria: this.store.criteria(),
      resultCount: this.store.jobs().length,
      jobIds: this.store.jobs().slice(0, 10).map((job) => job.id),
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
