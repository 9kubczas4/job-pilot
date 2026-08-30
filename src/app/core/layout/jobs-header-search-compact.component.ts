import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { AppLinks } from '@core/app-paths';
import {
  buildHeaderSearchQueryParams,
  DEFAULT_SEARCH_RADIUS_KM,
  SEARCH_RADIUS_OPTIONS_KM,
} from '@core/domains/jobs/header-search-query.utils';

/** App-shell header search for non-jobs pages — navigates to job search with query params. */
@Component({
  selector: 'app-jobs-header-search-compact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    headerSearch: '',
    '(document:click)': 'onDocumentClick($event)',
  },
  templateUrl: './jobs-header-search-compact.component.html',
  styleUrl: './jobs-header-search-compact.component.scss',
})
export class JobsHeaderSearchCompactComponent {
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly query = signal('');
  readonly locationQuery = signal('');
  readonly locationLat = signal<number | undefined>(undefined);
  readonly locationLng = signal<number | undefined>(undefined);
  readonly radiusKm = signal(DEFAULT_SEARCH_RADIUS_KM);
  readonly radiusPanelOpen = signal(false);

  readonly radiusOptions = SEARCH_RADIUS_OPTIONS_KM;

  onQueryChange(value: string): void {
    this.query.set(value);
    this.radiusPanelOpen.set(false);
  }

  onLocationChange(value: string): void {
    this.locationQuery.set(value);
    this.locationLat.set(undefined);
    this.locationLng.set(undefined);
    this.radiusPanelOpen.set(false);
  }

  toggleRadiusPanel(event: Event): void {
    event.stopPropagation();
    this.radiusPanelOpen.update((open) => !open);
  }

  selectRadius(radius: number): void {
    this.radiusKm.set(Number.isFinite(radius) ? radius : DEFAULT_SEARCH_RADIUS_KM);
    this.radiusPanelOpen.set(false);
    this.navigateToJobs();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.radiusPanelOpen.set(false);
    this.navigateToJobs();
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.radiusPanelOpen.set(false);
    }
  }

  private navigateToJobs(): void {
    void this.router.navigate(AppLinks.jobs, {
      queryParams: buildHeaderSearchQueryParams({
        searchQuery: this.query(),
        locationQuery: this.locationQuery(),
        locationLat: this.locationLat(),
        locationLng: this.locationLng(),
        radiusKm: this.radiusKm(),
      }),
    });
  }
}
