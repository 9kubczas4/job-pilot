import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AppLinks } from '@app/app-paths';
import { AppShellComponent } from '@core/layout/app-shell.component';
import { DEFAULT_SEARCH_RADIUS_KM } from '@shared/models/header-search.model';
import { HeaderUiStore } from '@shared/state/header-ui.store';
import { AppLogoComponent } from '@shared/ui/app-logo/app-logo.component';
import { FilterDrawerComponent } from '@shared/ui/filter-drawer/filter-drawer.component';
import { HeaderSearchComponent } from '@shared/ui/header-search/header-search.component';
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
import {
  JobResultsSheetComponent,
  JobSheetSnap,
} from '../../ui/job-results-sheet/job-results-sheet.component';
import { JobSearchCriteria } from '../../domain/search.model';

const MOBILE_LAYOUT_QUERY = '(max-width: 60rem)';

@Component({
  selector: 'app-job-search-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppShellComponent,
    AppLogoComponent,
    FilterDrawerComponent,
    HeaderSearchComponent,
    JobFiltersComponent,
    JobListComponent,
    JobMapComponent,
    JobResultsSheetComponent,
  ],
  templateUrl: './job-search.page.html',
  styleUrl: './job-search.page.scss',
})
export class JobSearchPageComponent implements OnInit {
  readonly store = inject(JobSearchStore);
  readonly savedJobs = inject(SavedJobsStore);
  readonly headerUi = inject(HeaderUiStore);
  readonly links = AppLinks;

  readonly isMobileLayout = signal(false);
  readonly searchExpanded = signal(false);
  readonly sheetSnap = signal<JobSheetSnap>('peek');
  readonly sheetFocusJobId = signal<string | null>(null);

  private readonly jobMap = viewChild<JobMapComponent>('jobMap');
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly syncingFromRoute = signal(false);
  private readonly syncingFromHeader = signal(false);
  private readonly lastAppliedTrigger = signal(0);

  readonly searchSummary = computed(() => {
    const query = this.headerUi.searchQuery().trim();
    const location = this.headerUi.locationQuery().trim();
    const radius = this.headerUi.radiusKm();

    if (query && location) {
      return `${query} · ${location} · ${radius} km`;
    }
    if (query) {
      return query;
    }
    if (location) {
      return `${location} · ${radius} km`;
    }
    return 'Search jobs';
  });

  constructor() {
    this.headerUi.enableFilters();
    this.destroyRef.onDestroy(() => {
      this.headerUi.disableFilters();
      this.headerUi.showHeader();
    });

    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        const mobileQuery = window.matchMedia(MOBILE_LAYOUT_QUERY);
        const syncLayout = () => this.isMobileLayout.set(mobileQuery.matches);

        syncLayout();
        mobileQuery.addEventListener('change', syncLayout);
        this.destroyRef.onDestroy(() => mobileQuery.removeEventListener('change', syncLayout));
      });
    }

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

      if (this.isMobileLayout()) {
        this.searchExpanded.set(false);
        this.sheetSnap.set('peek');
        this.sheetFocusJobId.set(null);
      }
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

    effect(() => {
      if (!this.isMobileLayout()) {
        return;
      }

      // Re-trigger map resize when sheet snap changes (visible map area shifts).
      this.sheetSnap();
      queueMicrotask(() => this.jobMap()?.notifyVisible());
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

  onMobileSelectJob(jobId: string): void {
    this.store.selectJob(jobId);
    this.sheetFocusJobId.set(jobId);
    this.sheetSnap.set('peek');
  }

  onSheetSnapChange(snap: JobSheetSnap): void {
    this.sheetSnap.set(snap);

    if (snap === 'collapsed') {
      this.sheetFocusJobId.set(null);
    }
  }

  clearSheetFocus(): void {
    this.sheetFocusJobId.set(null);
  }

  openSearch(): void {
    this.searchExpanded.set(true);
  }

  closeSearch(): void {
    this.searchExpanded.set(false);
    this.headerUi.applySearch();
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
