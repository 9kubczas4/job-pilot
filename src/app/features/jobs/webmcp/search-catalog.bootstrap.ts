import { inject, PLATFORM_ID, provideAppInitializer, type EnvironmentProviders, type Provider } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideHeaderSearchSlot } from '../state/header-search-slot.provider';
import { SearchCatalogService } from '../state/search-catalog.service';

export function provideSearchCatalogPreload(): EnvironmentProviders {
  return provideAppInitializer((): void | Promise<void> => {
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) {
      return;
    }

    return inject(SearchCatalogService).preload();
  });
}

/** Header search slot wiring and catalog preload for app-shell pages. */
export function provideJobsHeaderSearch(): Provider[] {
  return [provideHeaderSearchSlot()];
}
