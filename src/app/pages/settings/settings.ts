import { Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { HeaderComponent } from '../../components/header/header';
import { Theme, ThemeService } from '../../core/theme/theme.service';
import { Language, LANGUAGES, LanguageService } from '../../core/i18n/language.service';

@Component({
  selector: 'app-settings',
  imports: [TranslocoPipe, HeaderComponent],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsComponent {
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);

  readonly theme = this.themeService.theme;
  readonly language = this.languageService.language;

  readonly themeOptions: Theme[] = ['dark', 'light'];
  // Language names are shown in their own language, so they are not translated
  readonly languageOptions = LANGUAGES;

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  setLanguage(language: Language): void {
    this.languageService.setLanguage(language);
  }
}
