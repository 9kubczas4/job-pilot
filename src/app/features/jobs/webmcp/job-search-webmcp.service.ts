import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppLinks } from '@app/app-paths';
import { HeaderUiStore } from '@shared/state/header-ui.store';
import {
  enrichLocationCriteria,
  searchLocationEqual,
  syncHeaderFromCriteria,
} from '../domain/job-search-sync.utils';
import { JobFilterCriteria, JobSearchCriteria } from '../domain/search.model';
import { criteriaToQueryParams } from '../domain/search-url.utils';
import { JobSearchStore } from '../state/job-search.store';

export interface JobSearchToolResult {
  criteria: JobSearchCriteria;
  resultCount: number;
  jobIds: string[];
}

@Injectable({ providedIn: 'root' })
export class JobSearchWebMcpService {
  private readonly store = inject(JobSearchStore);
  private readonly headerUi = inject(HeaderUiStore);
  private readonly router = inject(Router);

  async applySearchCriteria(partial: JobSearchCriteria): Promise<JobSearchToolResult> {
    await this.store.loadJobs();
    this.store.applyCriteria(partial);
    return this.syncUiAndNavigate();
  }

  async applyFilterCriteria(partial: JobFilterCriteria): Promise<JobSearchToolResult> {
    await this.store.loadJobs();
    this.store.patchCriteria(partial);
    return this.syncUiAndNavigate();
  }

  private async syncUiAndNavigate(): Promise<JobSearchToolResult> {
    this.enrichStoredLocationIfNeeded();
    syncHeaderFromCriteria(this.headerUi, this.store.criteria());

    await this.router.navigate(AppLinks.jobs, {
      queryParams: criteriaToQueryParams(this.store.criteria()),
      replaceUrl: true,
    });

    return {
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
