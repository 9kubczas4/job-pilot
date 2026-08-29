import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AppShellComponent } from '@core/layout/app-shell.component';
import { HeaderUiStore } from '@shared/state/header-ui.store';
import { SavedJobsStore } from '@features/saved-jobs/state/saved-jobs.store';
import { criteriaToQueryParams, queryParamsToCriteria } from '../../domain/search-url.utils';
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

  private syncingFromRoute = false;
  private syncingFromHeader = false;

  constructor() {
    this.headerUi.enableFilters();
    this.destroyRef.onDestroy(() => this.headerUi.disableFilters());

    effect(() => {
      if (this.syncingFromRoute || this.syncingFromHeader) {
        return;
      }
      const params = criteriaToQueryParams(this.store.criteria());
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: params,
        replaceUrl: true,
      });
    });

    effect(() => {
      const criteria = this.store.criteria();
      this.headerUi.activeFilterCount.set(countActiveFilters(criteria));

      if (this.syncingFromHeader) {
        return;
      }

      const query = criteria.query ?? '';
      if (query !== this.headerUi.searchQuery()) {
        this.headerUi.searchQuery.set(query);
      }
    });

    effect(() => {
      const query = this.headerUi.searchQuery();
      const currentQuery = this.store.criteria().query ?? '';

      if (query === currentQuery) {
        return;
      }

      this.syncingFromHeader = true;
      this.store.patchCriteria({ query: query || undefined });
      this.syncingFromHeader = false;
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.syncingFromRoute = true;
      this.store.applyCriteria(
        queryParamsToCriteria(Object.fromEntries(params.keys.map((key) => [key, params.get(key) ?? undefined]))),
      );
      this.syncingFromRoute = false;
    });

    this.store.loadJobs();
    this.savedJobs.loadUserData();
  }

  onSelectJob(jobId: string): void {
    this.store.selectJob(jobId);
  }
}

function countActiveFilters(criteria: JobSearchCriteria): number {
  let count = 0;

  if (criteria.locations?.length) {
    count += criteria.locations.length;
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
