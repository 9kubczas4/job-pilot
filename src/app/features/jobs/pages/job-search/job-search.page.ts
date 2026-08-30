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
import { AppLinks, AppProfileMenuLinks } from '@core/app-paths';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { AppShellComponent } from '@core/layout/app-shell.component';
import { HeaderUiStore } from '@features/jobs/state/header-ui.store';
import { AuthPromptDialogComponent } from '@features/jobs/ui/auth-prompt-dialog/auth-prompt-dialog.component';
import { LogoComponent } from '@shared/ui/logo/logo.component';
import { FilterDrawerComponent } from '@shared/ui/filter-drawer/filter-drawer.component';
import { JobFilterDrawerComponent } from '@features/jobs/ui/job-filter-drawer/job-filter-drawer.component';
import { JobHeaderFiltersComponent } from '@features/jobs/ui/job-header-filters/job-header-filters.component';
import { JobHeaderSearchComponent } from '@features/jobs/shell/job-header-search.component';
import { ProfileMenuComponent } from '@shared/ui/profile-menu/profile-menu.component';
import { ThemeToggleComponent } from '@core/layout/theme-toggle/theme-toggle.component';
import { ToastService } from '@shared/ui/toast/toast.service';
import { SavedJobsStore } from '@features/jobs/state/saved-jobs.store';
import { JobApplicationsStore } from '@features/jobs/state/job-applications.store';
import {
  enrichLocationCriteria,
  searchLocationEqual,
} from '../../domain/job-search-sync.utils';
import { buildCityCentersFromJobs, resolveCityCenter } from '../../domain/city-catalog';
import { JobOffer } from '@features/jobs/domain/job.model';
import {
  criteriaToQueryParams,
  normalizeLocationCriteria,
  queryParamsEqual,
  queryParamsToCriteria,
  routeCriteriaEqual,
} from '@features/jobs/domain/search-url.utils';
import { JobSearchStore } from '@features/jobs/state/job-search.store';
import { JobFiltersComponent } from '@features/jobs/ui/job-filters/job-filters.component';
import { JobListComponent } from '@features/jobs/ui/job-list/job-list.component';
import { JobMapComponent } from '@features/jobs/ui/job-map/job-map.component';
import {
  JobResultsSheetComponent,
  JobSheetSnap,
} from '@features/jobs/ui/job-results-sheet/job-results-sheet.component';
import { JobSearchCriteria, JobSortOption } from '@features/jobs/domain/search.model';
import { DEFAULT_JOB_SORT, availableSortOptions } from '@features/jobs/domain/job-sort.utils';
import { extractTopSkills } from '@features/jobs/domain/job-filter.utils';
import { DEFAULT_SEARCH_RADIUS_KM } from '@features/jobs/domain/header-search.model';

const MOBILE_LAYOUT_QUERY = '(max-width: 60rem)';

@Component({
  selector: 'app-job-search-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppShellComponent,
    LogoComponent,
    AuthPromptDialogComponent,
    FilterDrawerComponent,
    JobFilterDrawerComponent,
    JobHeaderFiltersComponent,
    JobHeaderSearchComponent,
    ProfileMenuComponent,
    ThemeToggleComponent,
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
  readonly jobApplications = inject(JobApplicationsStore);
  readonly headerUi = inject(HeaderUiStore);
  readonly auth = inject(AuthService);
  readonly links = AppLinks;
  readonly profileMenuLinks = AppProfileMenuLinks;
  private readonly toast = inject(ToastService);

  readonly isMobileLayout = signal(false);
  readonly searchExpanded = signal(false);
  readonly sheetSnap = signal<JobSheetSnap>('peek');
  readonly sheetFocusJobId = signal<string | null>(null);
  readonly authPromptOpen = signal(false);

  private pendingSaveJobId: string | null = null;

  private readonly jobMap = viewChild<JobMapComponent>('jobMap');
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly syncingFromRoute = signal(false);
  private readonly syncingFromHeader = signal(false);
  private readonly lastAppliedTrigger = signal(0);
  private mobileCloseRequestSnapshot = 0;

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

  readonly sortOptions = computed(() => availableSortOptions(this.store.criteria()));
  readonly currentSort = computed(() => this.store.criteria().sort ?? DEFAULT_JOB_SORT);
  readonly searchMapCenter = computed(() => {
    const { locationLat, locationLng } = this.store.criteria();
    if (locationLat == null || locationLng == null) {
      return null;
    }

    return { lat: locationLat, lng: locationLng };
  });
  readonly searchMapRadiusKm = computed(() => this.store.criteria().radiusKm);
  readonly filterTopSkills = computed(() => extractTopSkills(this.store.allJobs()));

  constructor() {
    this.headerUi.enableFilters();
    this.applyRouteCriteria(this.route.snapshot.queryParamMap);
    this.lastAppliedTrigger.set(this.headerUi.searchApplyTrigger());

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

      this.router.navigate([], {
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
      const request = this.headerUi.mobileSearchCloseRequest();
      if (request === this.mobileCloseRequestSnapshot) {
        return;
      }

      this.mobileCloseRequestSnapshot = request;

      if (!this.isMobileLayout()) {
        return;
      }

      this.searchExpanded.set(false);
      this.sheetSnap.set('peek');
      this.sheetFocusJobId.set(null);
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
      this.applyRouteCriteria(params);
    });

    this.store.loadJobs();
    this.savedJobs.loadSavedJobs();
    this.jobApplications.loadApplications();
  }

  private applyRouteCriteria(params: { keys: string[]; get: (key: string) => string | null }): void {
    const routeCriteria = queryParamsToCriteria(
      Object.fromEntries(params.keys.map((key) => [key, params.get(key) ?? undefined])),
    );

    if (routeCriteriaEqual(this.store.criteria(), routeCriteria)) {
      return;
    }

    this.syncingFromRoute.set(true);
    this.store.setCriteriaFromRoute(routeCriteria);
    this.headerUi.syncFromCriteria(this.store.criteria());
    this.syncingFromRoute.set(false);
  }

  onSelectJob(jobId: string): void {
    this.store.selectJob(jobId);
  }

  onSortChange(sort: string): void {
    const value = sort as JobSortOption;
    this.store.patchCriteria({
      sort: value === DEFAULT_JOB_SORT ? undefined : value,
    });
  }

  onFiltersCriteriaChange(partial: Partial<JobSearchCriteria>): void {
    this.store.patchCriteria(partial);
  }

  onFilterChipRemoved(key: string): void {
    if (key === 'query') {
      this.store.patchCriteria({ query: undefined });
      this.headerUi.searchQuery.set('');
      return;
    }

    if (key === 'location') {
      this.store.patchCriteria({
        locations: undefined,
        locationLat: undefined,
        locationLng: undefined,
        radiusKm: undefined,
      });
      this.headerUi.locationQuery.set('');
      this.headerUi.locationLat.set(undefined);
      this.headerUi.locationLng.set(undefined);
      return;
    }

    if (key === 'salaryMin') {
      this.store.patchCriteria({ salaryMin: undefined });
      return;
    }

    const [type, value] = key.split(':');
    const criteria = this.store.criteria();

    if (type === 'workplace') {
      this.store.patchCriteria({
        workplace: criteria.workplace?.filter((item) => item !== value) as typeof criteria.workplace,
      });
    }
    if (type === 'seniority') {
      this.store.patchCriteria({
        seniority: criteria.seniority?.filter((item) => item !== value) as typeof criteria.seniority,
      });
    }
    if (type === 'contract') {
      this.store.patchCriteria({
        contracts: criteria.contracts?.filter((item) => item !== value) as typeof criteria.contracts,
      });
    }
    if (type === 'schedule') {
      this.store.patchCriteria({
        workSchedules: criteria.workSchedules?.filter(
          (item) => item !== value,
        ) as typeof criteria.workSchedules,
      });
    }
    if (type === 'skill') {
      this.store.patchCriteria({
        skills: criteria.skills?.filter((item) => item !== value),
      });
    }
  }

  onFiltersClearAll(): void {
    this.store.clearCriteria();
    this.headerUi.searchQuery.set('');
    this.headerUi.locationQuery.set('');
    this.headerUi.locationLat.set(undefined);
    this.headerUi.locationLng.set(undefined);
    this.headerUi.radiusKm.set(DEFAULT_SEARCH_RADIUS_KM);
  }

  onToggleSaveJob(jobId: string): void {
    if (!this.auth.isAuthenticated()) {
      this.pendingSaveJobId = jobId;
      this.authPromptOpen.set(true);
      return;
    }

    if (this.savedJobs.isSaved(jobId)) {
      this.savedJobs.unsaveJob(jobId);
      this.toast.show('Removed from saved jobs.');
      return;
    }

    this.savedJobs.saveJob(jobId);
    this.toast.show('Job saved.');
  }

  closeAuthPrompt(): void {
    this.authPromptOpen.set(false);
    this.pendingSaveJobId = null;
  }

  async confirmAuthPrompt(): Promise<void> {
    try {
      await this.auth.signInWithGoogle();
      this.authPromptOpen.set(false);

      const jobId = this.pendingSaveJobId;
      this.pendingSaveJobId = null;

      if (!jobId || this.savedJobs.isSaved(jobId)) {
        return;
      }

      await this.savedJobs.saveJob(jobId);
      this.toast.show('Job saved.');
    } catch {
      // User dismissed the provider popup or sign-in failed.
    }
  }

  onMobileSelectJob(jobId: string): void {
    this.store.selectJob(jobId);
    this.sheetFocusJobId.set(jobId);
    this.sheetSnap.set('half');
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
  if (criteria.workSchedules?.length) {
    count += criteria.workSchedules.length;
  }
  if (criteria.salaryMin != null) {
    count += 1;
  }

  return count;
}
