import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withExperimentalAutoCleanupInjectors } from '@angular/router';
import { provideExperimentalWebMcpForms } from '@angular/forms/signals';
import { routes } from './app.routes';
import { provideFirebase } from './core/firebase/firebase.providers';
import { provideSearchJobsWebMcpTool } from './core/webmcp/tools/search-jobs.tool';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideFirebase(),
    provideExperimentalWebMcpForms(),
    provideSearchJobsWebMcpTool(),
    provideRouter(routes, withExperimentalAutoCleanupInjectors()),
  ],
};
