import { effect, inject, Injectable } from '@angular/core';
import { HeaderUiStore } from '@shared/state/header-ui.store';
import { buildCityCentersFromJobs } from '../domain/city-catalog';
import {
  buildJobSearchSuggestions,
  buildLocationSearchSuggestions,
} from '../domain/search-suggestions';
import { JobSearchStore } from '../state/job-search.store';

@Injectable({ providedIn: 'root' })
export class SearchCatalogService {
  private readonly store = inject(JobSearchStore);
  private readonly headerUi = inject(HeaderUiStore);

  constructor() {
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
  }

  preload(): Promise<void> {
    return this.store.loadJobs();
  }
}
