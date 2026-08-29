import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppShellComponent } from '@core/layout/app-shell.component';
import { SavedJobsStore } from '@features/saved-jobs/state/saved-jobs.store';
import { criteriaToQueryParams, queryParamsToCriteria } from '../../domain/search-url.utils';
import { JobSearchStore } from '../../state/job-search.store';
import { JobFiltersComponent } from '../../ui/job-filters/job-filters.component';
import { JobListComponent } from '../../ui/job-list/job-list.component';
import { JobMapComponent } from '../../ui/job-map/job-map.component';

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
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private syncingFromRoute = false;

  constructor() {
    effect(() => {
      if (this.syncingFromRoute) {
        return;
      }
      const params = criteriaToQueryParams(this.store.criteria());
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: params,
        replaceUrl: true,
      });
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
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
