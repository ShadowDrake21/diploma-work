import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { tokenInterceptor } from '@core/interceptors/token.interceptor';
import { apiInterceptor } from '@core/interceptors/api.interceptor';
import { AppInitializerService } from '@core/services/app-initializer.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([authInterceptor, tokenInterceptor, apiInterceptor])
    ),

    provideAppInitializer(() => {
      const initialized = inject(AppInitializerService);
      return initialized.initialize();
    }),
  ],
};
