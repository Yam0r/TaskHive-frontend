import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../components/header/header';
import { Theme, ThemeService } from '../../core/theme/theme.service';

interface ThemeOption {
  value: Theme;
  label: string;
}

@Component({
  selector: 'app-settings',
  imports: [HeaderComponent],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsComponent {
  private readonly themeService = inject(ThemeService);

  readonly theme = this.themeService.theme;

  readonly themeOptions: ThemeOption[] = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
  ];

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }
}
