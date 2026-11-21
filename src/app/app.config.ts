import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BASE_PATH } from './api';
import { environment } from '../environments/environment';

import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { ThemeService } from './core/theme/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    {provide: BASE_PATH, useValue: environment.apiUrl},
    provideCharts(withDefaultRegisterables()),
    // Apply the saved theme before the first screen is rendered.
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
  ]
};
