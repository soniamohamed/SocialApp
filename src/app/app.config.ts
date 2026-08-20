import { ApplicationConfig, provideBrowserGlobalErrorListeners,provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),

    provideBrowserGlobalErrorListeners(),
    provideRouter(routes,withInMemoryScrolling({scrollPositionRestoration:'top'}),
    withViewTransitions(),withHashLocation()),
    provideHttpClient(withFetch())

  ]
};
