import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AppShellComponent } from '@core/layout/app-shell.component';
import { DEFAULT_SEARCH_RADIUS_KM } from '@shared/models/header-search.model';
import { HeaderUiStore } from '@shared/state/header-ui.store';
import { SavedJobsStore } from '@features/saved-jobs/state/saved-jobs.store';
import {
  buildCityCentersFromJobs,
  resolveCityCenter,
} from '../../domain/city-catalog';
import { JobOffer } from '../../domain/job.model';
import {
  buildJobSearchSuggestions,
  buildLocationSearchSuggestions,
} from '../../domain/search-suggestions';
import {
  criteriaToQueryParams,
  normalizeLocationCriteria,
  queryParamsEqual,
  queryParamsToCriteria,
  routeSearchCriteriaEqual,
} from '../../domain/search-url.utils';
import { JobSearchStore } from '../../state/job-search.store';
import { JobFiltersComponent } from '../../ui/job-filters/job-filters.component';
import { JobListComponent } from '../../ui/job-list/job-list.component';
import { JobMapComponent } from '../../ui/job-map/job-map.component';
import { JobSearchCriteria } from '../../domain/search.model';

@Component({
  selector: 'app-job-search-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppShellComponent, JobFiltersComponent, JobListComponent, JobMapComponent],
  templateUrl: './job-search.page.html',
  styleUrl: './job-search.page.scss',
})
export class JobSearchPageComponent implements OnInit {
  readonly store = inject(JobSearchStore);
  readonly savedJobs = inject(SavedJobsStore);
  private readonly headerUi = inject(HeaderUiStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly syncingFromRoute = signal(false);
  private readonly syncingFromHeader = signal(false);
  private readonly lastAppliedTrigger = signal(0);

  constructor() {
    this.headerUi.enableFilters();
    this.destroyRef.onDestroy(() => this.headerUi.disableFilters());

    effect(() => {
      if (this.syncingFromRoute() || this.syncingFromHeader()) {
        return;
      }

      const params = criteriaToQueryParams(this.store.criteria());
      if (queryParamsEqual(params, this.route.snapshot.queryParams)) {
        return;
      }

      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: params,
        replaceUrl: true,
      });
    });

    effect(() => {
      this.headerUi.activeFilterCount.set(countActiveFilters(this.store.criteria()));
    });

    effect(() => {
      const trigger = this.headerUi.searchApplyTrigger();
      if (trigger === this.lastAppliedTrigger()) {
        return;
      }

      if (this.syncingFromRoute() || this.syncingFromHeader()) {
        return;
      }

      const patch = untracked(() =>
        buildCriteriaPatchFromHeader(this.headerUi, this.store.allJobs()),
      );
      this.syncingFromHeader.set(true);
      this.store.patchSearchCriteria(patch);
      this.syncingFromHeader.set(false);
      this.lastAppliedTrigger.set(trigger);
    });

    effect(() => {
      const jobs = this.store.allJobs();
      const query = this.headerUi.searchQuery();
      this.headerUi.jobSuggestions.set(buildJobSearchSuggestions(jobs, query));
    });

    effect(() => {
      const jobs = this.store.allJobs();
      const catalog = buildCityCentersFromJobs(jobs);
      const query = this.headerUi.locationQuery();
      this.headerUi.locationSuggestions.set(buildLocationSearchSuggestions(catalog, query));
    });

    effect(() => {
      if (this.syncingFromRoute() || this.syncingFromHeader()) {
        return;
      }

      const jobs = this.store.allJobs();
      if (!jobs.length) {
        return;
      }

      const criteria = this.store.criteria();
      const enriched = enrichLocationCriteria(criteria, jobs);
      if (searchLocationEqual(criteria, enriched)) {
        return;
      }

      this.syncingFromHeader.set(true);
      this.store.patchSearchCriteria({
        locationLat: enriched.locationLat,
        locationLng: enriched.locationLng,
        radiusKm: enriched.radiusKm,
      });
      this.syncingFromHeader.set(false);
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const routeCriteria = queryParamsToCriteria(
        Object.fromEntries(params.keys.map((key) => [key, params.get(key) ?? undefined])),
      );

      if (routeSearchCriteriaEqual(this.store.criteria(), routeCriteria)) {
        return;
      }

      this.syncingFromRoute.set(true);
      this.store.applyRouteSearchCriteria(routeCriteria);
      syncHeaderFromCriteria(this.headerUi, this.store.criteria());
      this.syncingFromRoute.set(false);
    });

    this.store.loadJobs();
    this.savedJobs.loadUserData();
  }

  onSelectJob(jobId: string): void {
    this.store.selectJob(jobId);
  }
}

function syncHeaderFromCriteria(
  headerUi: HeaderUiStore,
  criteria: JobSearchCriteria,
): void {
  headerUi.searchQuery.set(criteria.query ?? '');
  headerUi.locationQuery.set(criteria.locations?.[0] ?? '');
  headerUi.locationLat.set(criteria.locationLat);
  headerUi.locationLng.set(criteria.locationLng);
  headerUi.radiusKm.set(criteria.radiusKm ?? DEFAULT_SEARCH_RADIUS_KM);
}

function buildCriteriaPatchFromHeader(
  headerUi: HeaderUiStore,
  jobs: JobOffer[],
): Pick<
  JobSearchCriteria,
  'query' | 'locations' | 'locationLat' | 'locationLng' | 'radiusKm'
> {
  const query = headerUi.searchQuery().trim();
  const locationQuery = headerUi.locationQuery().trim();
  const catalog = buildCityCentersFromJobs(jobs);
  const resolvedCity = resolveCityCenter(catalog, locationQuery);
  const locationPatch = normalizeLocationCriteria(
    locationQuery,
    headerUi.radiusKm(),
    headerUi.locationLat() ?? resolvedCity?.latitude,
    headerUi.locationLng() ?? resolvedCity?.longitude,
  );

  return {
    query: query || undefined,
    ...locationPatch,
  };
}

function enrichLocationCriteria(
  criteria: JobSearchCriteria,
  jobs: JobOffer[],
): JobSearchCriteria {
  if (criteria.locationLat != null || !criteria.locations?.[0]) {
    return criteria;
  }

  const city = resolveCityCenter(buildCityCentersFromJobs(jobs), criteria.locations[0]);
  if (!city) {
    return criteria;
  }

  return {
    ...criteria,
    locationLat: city.latitude,
    locationLng: city.longitude,
    radiusKm: criteria.radiusKm ?? DEFAULT_SEARCH_RADIUS_KM,
  };
}

function searchLocationEqual(a: JobSearchCriteria, b: JobSearchCriteria): boolean {
  return (
    (a.locations?.[0] ?? '') === (b.locations?.[0] ?? '') &&
    (a.locationLat ?? null) === (b.locationLat ?? null) &&
    (a.locationLng ?? null) === (b.locationLng ?? null) &&
    (a.radiusKm ?? null) === (b.radiusKm ?? null)
  );
}

function countActiveFilters(criteria: JobSearchCriteria): number {
  let count = 0;

  if (criteria.query) {
    count += 1;
  }
  if (criteria.locations?.length) {
    count += 1;
  }
  if (criteria.workplace?.length) {
    count += criteria.workplace.length;
  }
  if (criteria.skills?.length) {
    count += criteria.skills.length;
  }
  if (criteria.seniority?.length) {
    count += criteria.seniority.length;
  }
  if (criteria.contracts?.length) {
    count += criteria.contracts.length;
  }
  if (criteria.salaryMin != null) {
    count += 1;
  }

  return count;
}
