import { inject, type Provider } from '@angular/core';
import { HEADER_SEARCH_SLOT, type HeaderSearchSlotFacade } from '@core/layout/header-search-slot.token';
import { HeaderSearchPageSupport } from './header-search-page.support';

export function provideHeaderSearchSlot(): Provider {
  return {
    provide: HEADER_SEARCH_SLOT,
    useFactory: (): HeaderSearchSlotFacade => {
      const support = inject(HeaderSearchPageSupport);
      const ui = support.headerUi;

      return {
        searchQuery: ui.searchQuery,
        locationQuery: ui.locationQuery,
        radiusKm: ui.radiusKm,
        jobSuggestions: ui.jobSuggestions,
        locationSuggestions: ui.locationSuggestions,
        onSearchQueryChange: (value, jobsLink, onJobsSearchPage) =>
          support.onSearchQueryChange(value, jobsLink, onJobsSearchPage),
        onLocationQueryChange: (value, jobsLink, onJobsSearchPage) =>
          support.onLocationQueryChange(value, jobsLink, onJobsSearchPage),
        onLocationCoordsChange: (lat, lng) => support.onLocationCoordsChange(lat, lng),
        onRadiusChange: (value) => support.onRadiusChange(value),
        applySearch: (jobsLink, onJobsSearchPage) =>
          support.applySearch(jobsLink, onJobsSearchPage),
      };
    },
  };
}
