import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { HeaderSearchComponent } from '@features/jobs/ui/header-search/header-search.component';
import { HeaderSearchPageSupport } from '@features/jobs/state/header-search-page.support';

/** App-shell header search slot — wires dumb UI to {@link HeaderSearchPageSupport}. */
@Component({
  selector: 'app-job-header-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    headerSearch: '',
  },
  imports: [HeaderSearchComponent],
  template: `
    <app-header-search
      [searchQuery]="headerSearch.headerUi.searchQuery()"
      [locationQuery]="headerSearch.headerUi.locationQuery()"
      [radiusKm]="headerSearch.headerUi.radiusKm()"
      [jobSuggestions]="headerSearch.headerUi.jobSuggestions()"
      [locationSuggestions]="headerSearch.headerUi.locationSuggestions()"
      (searchQueryChange)="headerSearch.onSearchQueryChange($event, jobsLink(), onJobsSearchPage())"
      (locationQueryChange)="onLocationQueryChange($event)"
      (locationCoordsChange)="onLocationCoordsChange($event)"
      (radiusChange)="headerSearch.onRadiusChange($event)"
      (searchApply)="headerSearch.applySearch(jobsLink(), onJobsSearchPage())"
    />
  `,
})
export class JobHeaderSearchComponent {
  readonly jobsLink = input.required<readonly string[]>();
  readonly onJobsSearchPage = input(false);

  readonly headerSearch = inject(HeaderSearchPageSupport);

  onLocationQueryChange(value: string): void {
    this.headerSearch.onLocationQueryChange(value, this.jobsLink(), this.onJobsSearchPage());
  }

  onLocationCoordsChange(coords: { lat?: number; lng?: number }): void {
    this.headerSearch.onLocationCoordsChange(coords.lat, coords.lng);
  }
}
