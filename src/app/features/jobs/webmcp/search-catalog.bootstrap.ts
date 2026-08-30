import {
  APP_INITIALIZER,
  inject,
  makeEnvironmentProviders,
  PLATFORM_ID,
  type EnvironmentProviders,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SearchCatalogService } from '../state/search-catalog.service';

export function provideSearchCatalogPreload(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const platformId = inject(PLATFORM_ID);

        return () => {
          if (!isPlatformBrowser(platformId)) {
            return Promise.resolve();
          }

          return inject(SearchCatalogService).preload();
        };
      },
    },
  ]);
}
