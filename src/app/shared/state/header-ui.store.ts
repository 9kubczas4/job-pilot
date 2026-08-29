import { Injectable, signal } from '@angular/core';
import {
  DEFAULT_SEARCH_RADIUS_KM,
  JobSearchSuggestion,
  LocationSearchSuggestion,
} from '@shared/models/header-search.model';

@Injectable({ providedIn: 'root' })
export class HeaderUiStore {
  readonly filtersOpen = signal(false);
  readonly filtersEnabled = signal(false);
  readonly searchQuery = signal('');
  readonly locationQuery = signal('');
  readonly locationLat = signal<number | undefined>(undefined);
  readonly locationLng = signal<number | undefined>(undefined);
  readonly radiusKm = signal(DEFAULT_SEARCH_RADIUS_KM);
  readonly jobSuggestions = signal<JobSearchSuggestion[]>([]);
  readonly locationSuggestions = signal<LocationSearchSuggestion[]>([]);
  readonly activeFilterCount = signal(0);
  readonly searchApplyTrigger = signal(0);

  applySearch(): void {
    this.searchApplyTrigger.update((value) => value + 1);
  }

  openFilters(): void {
    this.filtersOpen.set(true);
  }

  closeFilters(): void {
    this.filtersOpen.set(false);
  }

  toggleFilters(): void {
    this.filtersOpen.update((open) => !open);
  }

  enableFilters(): void {
    this.filtersEnabled.set(true);
  }

  disableFilters(): void {
    this.filtersEnabled.set(false);
    this.filtersOpen.set(false);
  }
}
