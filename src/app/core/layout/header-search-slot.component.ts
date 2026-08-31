import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { AppLinks } from '@core/app-paths';
import {
  HeaderSearchComponent,
  HeaderSearchVariant,
} from '@core/layout/header-search/header-search.component';
import { HEADER_SEARCH_SLOT } from '@core/layout/header-search-slot.token';

/** App-shell header search slot - wires layout UI to {@link HEADER_SEARCH_SLOT}. */
@Component({
  selector: 'app-header-search-slot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    headerSearch: '',
  },
  imports: [HeaderSearchComponent],
  template: `
    <app-header-search
      [variant]="variant()"
      [searchQuery]="slot.searchQuery()"
      [locationQuery]="slot.locationQuery()"
      [radiusKm]="slot.radiusKm()"
      [jobSuggestions]="slot.jobSuggestions()"
      [locationSuggestions]="slot.locationSuggestions()"
      [queryUpdateActive]="slot.queryToolActive()"
      [locationUpdateActive]="slot.locationToolActive()"
      [radiusUpdateActive]="slot.radiusToolActive()"
      (searchQueryChange)="slot.onSearchQueryChange($event, jobsLink(), onJobsSearchPage())"
      (locationQueryChange)="onLocationQueryChange($event)"
      (locationCoordsChange)="onLocationCoordsChange($event)"
      (radiusChange)="slot.onRadiusChange($event)"
      (searchApply)="slot.applySearch(jobsLink(), onJobsSearchPage())"
    />
  `,
})
export class HeaderSearchSlotComponent {
  readonly jobsLink = input<readonly string[]>(AppLinks.jobs);
  readonly onJobsSearchPage = input(false);
  readonly variant = input<HeaderSearchVariant>('full');

  protected readonly slot = inject(HEADER_SEARCH_SLOT);

  onLocationQueryChange(value: string): void {
    this.slot.onLocationQueryChange(value, this.jobsLink(), this.onJobsSearchPage());
  }

  onLocationCoordsChange(coords: { lat?: number; lng?: number }): void {
    this.slot.onLocationCoordsChange(coords.lat, coords.lng);
  }
}
