import { Component, computed, inject, Input } from '@angular/core';

import { LanguageService } from '../../core/i18n/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  private readonly languageService = inject(LanguageService);

  @Input() title = '';

  /** Today's date in the current UI language, e.g. "Saturday, November 21, 2026". */
  readonly formattedDate = computed(() => {
    const date = new Intl.DateTimeFormat(this.languageService.locale(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
    return date.charAt(0).toUpperCase() + date.slice(1);
  });
}
