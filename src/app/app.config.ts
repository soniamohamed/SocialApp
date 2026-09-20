
import { ApplicationConfig, provideBrowserGlobalErrorListeners,provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { headersInterceptor } from './core/interceptors/headers/headers-interceptor';
import { errorsInterceptor } from './core/interceptors/errors/errors-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),

    provideBrowserGlobalErrorListeners(),
    provideRouter(routes,withInMemoryScrolling({scrollPositionRestoration:'top'}),
    withViewTransitions(),withHashLocation()),
    provideHttpClient(withFetch(),withInterceptors([headersInterceptor,errorsInterceptor]))

  ]
};
