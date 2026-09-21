import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';

import {
  provideRouter,
  withHashLocation,
  withInMemoryScrolling,
  withViewTransitions
} from '@angular/router';

import {
  provideHttpClient,
  withFetch,
  withInterceptors
} from '@angular/common/http';

import {
  provideTranslateService
} from '@ngx-translate/core';

import {
  provideTranslateHttpLoader
} from '@ngx-translate/http-loader';

import { routes } from './app.routes';

import { headersInterceptor } from './core/interceptors/headers/headers-interceptor';
import { errorsInterceptor } from './core/interceptors/errors/errors-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [

    provideZoneChangeDetection(),

    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top'
      }),
      withViewTransitions(),
      withHashLocation()
    ),

    provideHttpClient(
      withFetch(),
      withInterceptors([
        headersInterceptor,
        errorsInterceptor
      ])
    ),

    // ================================
    // TRANSLATION
    // ================================
    provideTranslateService({
  fallbackLang: 'en',
  lang: 'en',

  loader: provideTranslateHttpLoader({
    prefix: './assets/i18n/',
    suffix: '.json'
  })
})

  ]
};