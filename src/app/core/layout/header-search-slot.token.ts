import { InjectionToken, Signal } from '@angular/core';
import {
  JobSearchSuggestion,
  LocationSearchSuggestion,
} from '@core/domains/jobs/header-search.model';

/** Cross-feature header search wiring - implemented by jobs, consumed from core layout. */
export interface HeaderSearchSlotFacade {
  readonly searchQuery: Signal<string>;
  readonly locationQuery: Signal<string>;
  readonly radiusKm: Signal<number>;
  readonly jobSuggestions: Signal<JobSearchSuggestion[]>;
  readonly locationSuggestions: Signal<LocationSearchSuggestion[]>;

  onSearchQueryChange(
    value: string,
    jobsLink: readonly string[],
    onJobsSearchPage: boolean,
  ): void;

  onLocationQueryChange(
    value: string,
    jobsLink: readonly string[],
    onJobsSearchPage: boolean,
  ): void;

  onLocationCoordsChange(lat: number | undefined, lng: number | undefined): void;
  onRadiusChange(value: number): void;
  applySearch(jobsLink: readonly string[], onJobsSearchPage: boolean): void;
}

export const HEADER_SEARCH_SLOT = new InjectionToken<HeaderSearchSlotFacade>(
  'HEADER_SEARCH_SLOT',
);
