import { DestroyRef, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  buildHeaderSearchQueryParams,
  DEFAULT_SEARCH_RADIUS_KM,
} from '@features/jobs/domain/header-search.model';
import { HeaderUiStore } from './header-ui.store';
import { SearchCatalogService } from './search-catalog.service';

const SEARCH_DEBOUNCE_MS = 400;

@Injectable({ providedIn: 'root' })
export class HeaderSearchPageSupport {
  readonly headerUi = inject(HeaderUiStore);

  private readonly catalog = inject(SearchCatalogService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.clearDebounce());
  }

  onSearchQueryChange(
    value: string,
    jobsLink: readonly string[],
    onJobsSearchPage: boolean,
  ): void {
    void this.catalog.ensureCatalogLoaded();
    this.headerUi.searchQuery.set(value);
    this.scheduleApplySearch(jobsLink, onJobsSearchPage);
  }

  onLocationQueryChange(
    value: string,
    jobsLink: readonly string[],
    onJobsSearchPage: boolean,
    resetCoords = true,
  ): void {
    void this.catalog.ensureCatalogLoaded();
    this.headerUi.locationQuery.set(value);
    if (resetCoords) {
      this.headerUi.locationLat.set(undefined);
      this.headerUi.locationLng.set(undefined);
    }
    this.scheduleApplySearch(jobsLink, onJobsSearchPage);
  }

  onLocationCoordsChange(lat: number | undefined, lng: number | undefined): void {
    this.headerUi.locationLat.set(lat);
    this.headerUi.locationLng.set(lng);
  }

  onRadiusChange(value: number): void {
    this.headerUi.radiusKm.set(Number.isFinite(value) ? value : DEFAULT_SEARCH_RADIUS_KM);
  }

  applySearch(jobsLink: readonly string[], onJobsSearchPage: boolean): void {
    void this.catalog.ensureCatalogLoaded();
    this.clearDebounce();

    if (onJobsSearchPage) {
      this.headerUi.applySearch();
      this.headerUi.requestMobileSearchClose();
      return;
    }

    this.router
      .navigate(jobsLink, { queryParams: this.buildQueryParams() })
      .then((success) => {
        if (success) {
          this.headerUi.applySearch();
          this.headerUi.requestMobileSearchClose();
        }
      });
  }

  private scheduleApplySearch(jobsLink: readonly string[], onJobsSearchPage: boolean): void {
    if (!onJobsSearchPage) {
      return;
    }

    this.clearDebounce();
    this.debounceTimer = setTimeout(
      () => this.applySearch(jobsLink, true),
      SEARCH_DEBOUNCE_MS,
    );
  }

  private buildQueryParams(): Record<string, string> {
    return buildHeaderSearchQueryParams({
      searchQuery: this.headerUi.searchQuery(),
      locationQuery: this.headerUi.locationQuery(),
      locationLat: this.headerUi.locationLat(),
      locationLng: this.headerUi.locationLng(),
      radiusKm: this.headerUi.radiusKm(),
    });
  }

  private clearDebounce(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}
