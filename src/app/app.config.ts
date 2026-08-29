import {
  ApplicationConfig,
  APP_INITIALIZER,
  inject,
  PLATFORM_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withExperimentalAutoCleanupInjectors } from '@angular/router';
import { provideExperimentalWebMcpForms } from '@angular/forms/signals';
import { routes } from './app.routes';
import { provideFirebase } from '@core/firebase/firebase.providers';
import { provideSearchJobsWebMcpTool } from '@features/jobs/webmcp/search-jobs.tool';
import { environment } from '@environments/environment';
import { isGoogleMapsConfigured, loadGoogleMapsApi } from '@shared/map/google-maps-loader';
import { GOOGLE_MAPS_API_KEY } from '@shared/map/google-maps-config';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideFirebase(),
    provideExperimentalWebMcpForms(),
    provideSearchJobsWebMcpTool(),
    provideRouter(routes, withExperimentalAutoCleanupInjectors()),
    { provide: GOOGLE_MAPS_API_KEY, useValue: environment.googleMapsApiKey },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const platformId = inject(PLATFORM_ID);

        return () => {
          if (!isPlatformBrowser(platformId) || !isGoogleMapsConfigured(environment.googleMapsApiKey)) {
            return Promise.resolve();
          }

          return loadGoogleMapsApi(environment.googleMapsApiKey);
        };
      },
    },
    provideClientHydration(
      withHttpTransferCacheOptions({
        includeRequestsWithAuthHeaders: true,
      }),
    ),
  ],
};
