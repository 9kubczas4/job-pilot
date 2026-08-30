import { inject, PLATFORM_ID, provideAppInitializer, type EnvironmentProviders } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
