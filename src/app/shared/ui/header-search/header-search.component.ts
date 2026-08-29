import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppLinks } from '@app/app-paths';
import {
  DEFAULT_SEARCH_RADIUS_KM,
  JobSearchSuggestion,
  LocationSearchSuggestion,
  SEARCH_RADIUS_OPTIONS_KM,
} from '@shared/models/header-search.model';
import { HeaderUiStore } from '@shared/state/header-ui.store';

const SEARCH_DEBOUNCE_MS = 400;

@Component({
  selector: 'app-header-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './header-search.component.html',
  styleUrl: './header-search.component.scss',
})
export class HeaderSearchComponent {
  readonly headerUi = inject(HeaderUiStore);
  readonly radiusOptions = SEARCH_RADIUS_OPTIONS_KM;

  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly jobPanelOpen = signal(false);
  readonly locationPanelOpen = signal(false);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private skipLocationCoordReset = false;

  constructor() {
    this.destroyRef.onDestroy(() => this.clearDebounce());
  }

  onJobQueryChange(value: string): void {
    this.headerUi.searchQuery.set(value);
    this.jobPanelOpen.set(value.trim().length >= 2);
    this.locationPanelOpen.set(false);
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
    this.scheduleApplySearch();
  }

  onRadiusChange(value: string | number): void {
    const radius = Number(value);
    if (Number.isFinite(radius)) {
      this.headerUi.radiusKm.set(radius);
    } else {
      this.headerUi.radiusKm.set(DEFAULT_SEARCH_RADIUS_KM);
    }
    this.applySearch();
  }

  onJobFocus(): void {
    if (this.headerUi.searchQuery().trim().length >= 2) {
      this.jobPanelOpen.set(true);
    }
    this.locationPanelOpen.set(false);
  }

  onLocationFocus(): void {
    this.locationPanelOpen.set(true);
    this.jobPanelOpen.set(false);
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.jobPanelOpen.set(false);
      this.locationPanelOpen.set(false);
    }
  }

  readonly links = AppLinks;
  readonly defaultRadius = DEFAULT_SEARCH_RADIUS_KM;

  private scheduleApplySearch(): void {
    if (!this.isJobsRoute()) {
      return;
    }

    this.clearDebounce();
    this.debounceTimer = setTimeout(() => this.applySearchOnJobsPage(), SEARCH_DEBOUNCE_MS);
  }

  private applySearch(): void {
    this.jobPanelOpen.set(false);
    this.locationPanelOpen.set(false);

    if (this.isJobsRoute()) {
      this.applySearchOnJobsPage();
      return;
    }

    void this.router.navigate(this.links.jobs, { queryParams: this.buildQueryParams() });
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

  private isJobsRoute(): boolean {
    return this.router.url.startsWith('/jobs');
  }
}
