import { ApplicationConfig, APP_INITIALIZER, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withExperimentalAutoCleanupInjectors } from '@angular/router';
import { provideExperimentalWebMcpForms } from '@angular/forms/signals';
import { routes } from './app.routes';
import { provideFirebase } from '@core/firebase/firebase.providers';
import { provideSearchJobsWebMcpTool } from '@features/jobs/webmcp/search-jobs.tool';
import { environment } from '@environments/environment';
import { isGoogleMapsConfigured, loadGoogleMapsApi } from '@shared/map/google-maps-loader';
import { GOOGLE_MAPS_API_KEY } from '@shared/map/google-maps-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideFirebase(),
    provideExperimentalWebMcpForms(),
    provideSearchJobsWebMcpTool(),
    provideRouter(routes, withExperimentalAutoCleanupInjectors()),
    { provide: GOOGLE_MAPS_API_KEY, useValue: environment.googleMapsApiKey },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => () => {
        if (!isGoogleMapsConfigured(environment.googleMapsApiKey)) {
          return Promise.resolve();
        }
        return loadGoogleMapsApi(environment.googleMapsApiKey);
      },
    },
  ],
};
