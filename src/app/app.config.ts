import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
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
import { provideJobsHeaderSearch } from '@features/jobs/webmcp/search-catalog.bootstrap';
import { environment } from '@environments/environment';
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
    ...provideJobsHeaderSearch(),
    provideRouter(routes, withExperimentalAutoCleanupInjectors()),
    { provide: GOOGLE_MAPS_API_KEY, useValue: environment.googleMapsApiKey },
    provideAppInitializer((): void => {
      inject(AnalyticsService).startRouterTracking();
    }),
    provideClientHydration(
      withHttpTransferCacheOptions({
        includeRequestsWithAuthHeaders: true,
      }),
    ),
  ],
};
