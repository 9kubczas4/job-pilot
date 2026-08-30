import {
  ApplicationConfig,
  inject,
  PLATFORM_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withExperimentalAutoCleanupInjectors } from '@angular/router';
import { routes } from './app.routes';
import { provideFirebase } from '@core/infrastructure/firebase/firebase.providers';
import { AnalyticsService } from '@core/infrastructure/analytics/analytics.service';
import { provideSearchJobsWebMcpTool } from '@features/jobs/webmcp/tools/search-jobs/search-jobs.tool';
import { provideFilterJobsWebMcpTool } from '@features/jobs/webmcp/tools/filter-jobs/filter-jobs.tool';
import { provideGetProfileWebMcpTool } from '@features/profile/webmcp/profile.tools';
import { provideGetJobWebMcpTool } from '@features/jobs/webmcp/tools/get-job/get-job.tool';
import { provideSavedJobsWebMcpTools } from '@features/jobs/webmcp/tools/saved-jobs/saved-jobs.tool';
import { provideApplyJobWebMcpTool } from '@features/jobs/webmcp/tools/apply-job/apply-job.tool';
import {
  provideSearchCatalogPreload,
  provideJobsHeaderSearch,
} from '@features/jobs/webmcp/search-catalog.bootstrap';
import { environment } from '@environments/environment';
import { isGoogleMapsConfigured, loadGoogleMapsApi } from '@shared/map/google-maps-loader';
import { GOOGLE_MAPS_API_KEY } from '@shared/map/google-maps-config';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideFirebase(),
    provideSearchJobsWebMcpTool(),
    provideFilterJobsWebMcpTool(),
    provideGetProfileWebMcpTool(),
    provideGetJobWebMcpTool(),
    provideSavedJobsWebMcpTools(),
    provideApplyJobWebMcpTool(),
    provideSearchCatalogPreload(),
    ...provideJobsHeaderSearch(),
    provideRouter(routes, withExperimentalAutoCleanupInjectors()),
    { provide: GOOGLE_MAPS_API_KEY, useValue: environment.googleMapsApiKey },
    provideAppInitializer((): void => {
      inject(AnalyticsService).startRouterTracking();
    }),
    provideAppInitializer((): void | Promise<void> => {
      const platformId = inject(PLATFORM_ID);

      if (!isPlatformBrowser(platformId) || !isGoogleMapsConfigured(environment.googleMapsApiKey)) {
        return;
      }

      return loadGoogleMapsApi(environment.googleMapsApiKey);
    }),
    provideClientHydration(
      withHttpTransferCacheOptions({
        includeRequestsWithAuthHeaders: true,
      }),
    ),
  ],
};
