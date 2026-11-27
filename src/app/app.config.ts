import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeCs from '@angular/common/locales/cs';
import localeRu from '@angular/common/locales/ru';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';
import { BASE_PATH } from './api';
import { environment } from '../environments/environment';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { ThemeService } from './core/theme/theme.service';
import { LanguageService } from './core/i18n/language.service';
import { TranslocoHttpLoader } from './core/i18n/transloco-loader';

// Date formats for DatePipe ('en' is built in)
registerLocaleData(localeRu);
registerLocaleData(localeCs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    { provide: BASE_PATH, useValue: environment.apiUrl },
    provideCharts(withDefaultRegisterables()),
    provideTransloco({
      config: {
        availableLangs: ['en', 'ru', 'cs'],
        defaultLang: 'en',
        fallbackLang: 'en',
        missingHandler: { useFallbackTranslation: true },
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    // Apply the saved theme before the first screen is rendered.
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
    // Load the saved language before the first screen is rendered.
    provideAppInitializer(() => inject(LanguageService).init()),
  ],
};
