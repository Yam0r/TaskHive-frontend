import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BASE_PATH } from './api';
import { environment } from '../environments/environment.development';

import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { authInterceptor } from './core/interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    provideHttpClient(),
    {provide: BASE_PATH, useValue: environment.apiUrl},
    provideCharts(withDefaultRegisterables()),
  ]
};
