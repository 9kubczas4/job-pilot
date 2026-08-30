import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppLinks } from '@core/app-paths';
import { DEFAULT_SEARCH_RADIUS_KM } from '@shared/models/header-search.model';
import { JobSearchToolResult } from './job-search-tool-result.model';
import { HeaderUiStore } from '@shared/state/header-ui.store';
import { buildCityCentersFromJobs, resolveCityCenter } from '../domain/city-catalog';
import {
  enrichLocationCriteria,
  searchLocationEqual,
  syncHeaderFromCriteria,
} from '../domain/job-search-sync.utils';
import { JobFilterCriteria } from '../domain/search.model';
import { criteriaToQueryParams } from '../domain/search-url.utils';
import { JobSearchStore } from '../state/job-search.store';
import {
  filterFieldsChanged,
  JobSearchInput,
  normalizeFilterPatch,
  searchFieldsChanged,
} from './webmcp-criteria.utils';

@Injectable({ providedIn: 'root' })
export class JobSearchWebMcpService {
  private readonly store = inject(JobSearchStore);
  private readonly headerUi = inject(HeaderUiStore);
  private readonly router = inject(Router);

  async applySearchCriteria(input: JobSearchInput): Promise<JobSearchToolResult> {
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

    return this.syncUiAndNavigate(() => searchFieldsChanged(before, this.store.criteria()));
  }

  async applyFilterCriteria(input: JobFilterCriteria): Promise<JobSearchToolResult> {
    await this.store.loadJobs();

    const before = this.store.criteria();
    this.store.patchCriteria(normalizeFilterPatch(input));

    return this.syncUiAndNavigate(() => filterFieldsChanged(before, this.store.criteria()));
  }

  private async syncUiAndNavigate(changed: () => boolean): Promise<JobSearchToolResult> {
    this.enrichStoredLocationIfNeeded();
    syncHeaderFromCriteria(this.headerUi, this.store.criteria());

    await this.router.navigate(AppLinks.jobs, {
      queryParams: criteriaToQueryParams(this.store.criteria()),
      replaceUrl: true,
    });

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
