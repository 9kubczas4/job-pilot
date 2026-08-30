import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  DEFAULT_SEARCH_RADIUS_KM,
  JobSearchSuggestion,
  LocationSearchSuggestion,
  SEARCH_RADIUS_OPTIONS_KM,
} from '@features/jobs/domain/header-search.model';
import { HeaderUiStore } from '@features/jobs/state/header-ui.store';

const SEARCH_DEBOUNCE_MS = 400;

@Component({
  selector: 'app-header-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  imports: [],
  templateUrl: './header-search.component.html',
  styleUrl: './header-search.component.scss',
})
export class HeaderSearchComponent {
  readonly jobsLink = input.required<readonly string[]>();

  readonly headerUi = inject(HeaderUiStore);
  readonly radiusOptions = SEARCH_RADIUS_OPTIONS_KM;

  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly jobPanelOpen = signal(false);
  readonly locationPanelOpen = signal(false);
  readonly radiusPanelOpen = signal(false);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private skipLocationCoordReset = false;

  constructor() {
    this.destroyRef.onDestroy(() => this.clearDebounce());
  }

  onJobQueryChange(value: string): void {
    this.headerUi.searchQuery.set(value);
    this.jobPanelOpen.set(value.trim().length >= 2);
    this.locationPanelOpen.set(false);
    this.radiusPanelOpen.set(false);
    this.scheduleApplySearch();
  }

  onLocationQueryChange(value: string): void {
    this.headerUi.locationQuery.set(value);
    if (!this.skipLocationCoordReset) {
      this.headerUi.locationLat.set(undefined);
      this.headerUi.locationLng.set(undefined);
    }
    this.locationPanelOpen.set(true);
    this.jobPanelOpen.set(false);
    this.radiusPanelOpen.set(false);
    this.scheduleApplySearch();
  }

  onRadiusChange(value: number): void {
    if (Number.isFinite(value)) {
      this.headerUi.radiusKm.set(value);
    } else {
      this.headerUi.radiusKm.set(DEFAULT_SEARCH_RADIUS_KM);
    }
    this.applySearch();
  }

  toggleRadiusPanel(event: Event): void {
    event.stopPropagation();
    const nextOpen = !this.radiusPanelOpen();
    this.radiusPanelOpen.set(nextOpen);
    this.jobPanelOpen.set(false);
    this.locationPanelOpen.set(false);
  }

  selectRadius(radius: number): void {
    this.onRadiusChange(radius);
    this.radiusPanelOpen.set(false);
  }

  onJobFocus(): void {
    if (this.headerUi.searchQuery().trim().length >= 2) {
      this.jobPanelOpen.set(true);
    }
    this.locationPanelOpen.set(false);
    this.radiusPanelOpen.set(false);
  }

  onLocationFocus(): void {
    this.locationPanelOpen.set(true);
    this.jobPanelOpen.set(false);
    this.radiusPanelOpen.set(false);
  }

  selectJobSuggestion(suggestion: JobSearchSuggestion): void {
    this.headerUi.searchQuery.set(suggestion.value);
    this.jobPanelOpen.set(false);
    this.applySearch();
  }

  selectLocationSuggestion(suggestion: LocationSearchSuggestion): void {
    this.skipLocationCoordReset = true;
    this.headerUi.locationQuery.set(suggestion.city);
    this.headerUi.locationLat.set(suggestion.latitude);
    this.headerUi.locationLng.set(suggestion.longitude);
    this.locationPanelOpen.set(false);
    this.applySearch();
    queueMicrotask(() => {
      this.skipLocationCoordReset = false;
    });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.applySearch();
  }

  suggestionKindLabel(kind: JobSearchSuggestion['kind']): string {
    switch (kind) {
      case 'title':
        return 'Role';
      case 'company':
        return 'Company';
      case 'skill':
        return 'Skill';
      default:
        return 'Keyword';
    }
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.jobPanelOpen.set(false);
      this.locationPanelOpen.set(false);
      this.radiusPanelOpen.set(false);
    }
  }

  readonly defaultRadius = DEFAULT_SEARCH_RADIUS_KM;

  private scheduleApplySearch(): void {
    if (!this.isJobsSearchPage()) {
      return;
    }

    this.clearDebounce();
    this.debounceTimer = setTimeout(() => this.applySearchOnJobsPage(), SEARCH_DEBOUNCE_MS);
  }

  private applySearch(): void {
    this.jobPanelOpen.set(false);
    this.locationPanelOpen.set(false);
    this.radiusPanelOpen.set(false);

    if (this.isJobsSearchPage()) {
      this.applySearchOnJobsPage();
      this.headerUi.requestMobileSearchClose();
      return;
    }

    void this.router
      .navigate(this.jobsLink(), { queryParams: this.buildQueryParams() })
      .then((success) => {
        if (success) {
          this.headerUi.applySearch();
          this.headerUi.requestMobileSearchClose();
        }
      });
  }

  private applySearchOnJobsPage(): void {
    this.clearDebounce();
    this.headerUi.applySearch();
  }

  private buildQueryParams(): Record<string, string> {
    const queryParams: Record<string, string> = {};
    const query = this.headerUi.searchQuery().trim();
    const location = this.headerUi.locationQuery().trim();
    const radius = this.headerUi.radiusKm() || DEFAULT_SEARCH_RADIUS_KM;

    if (query) {
      queryParams['q'] = query;
    }
    if (location) {
      queryParams['location'] = location;
      queryParams['radius'] = String(radius);
      const lat = this.headerUi.locationLat();
      const lng = this.headerUi.locationLng();
      if (lat != null && lng != null) {
        queryParams['lat'] = String(lat);
        queryParams['lng'] = String(lng);
      }
    }

    return queryParams;
  }

  private clearDebounce(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  private isJobsSearchPage(): boolean {
    const path = this.router.url.split('?')[0]?.split('#')[0] ?? '';
    const jobsPath = this.jobsLink()
      .filter((segment) => segment !== '/')
      .join('/');
    const normalizedJobsPath = jobsPath.startsWith('/') ? jobsPath : `/${jobsPath}`;

    return path === normalizedJobsPath || path === `${normalizedJobsPath}/`;
  }
}
