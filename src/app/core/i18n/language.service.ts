import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

export type Language = 'en' | 'ru' | 'cs';

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
  { value: 'cs', label: 'Čeština' },
];

const STORAGE_KEY = 'taskhive.lang';
const DEFAULT_LANGUAGE: Language = 'en';

/** Locale used for dates and numbers (Intl, DatePipe, FullCalendar). */
const LOCALES: Record<Language, string> = { en: 'en-US', ru: 'ru-RU', cs: 'cs-CZ' };

/**
 * Current UI language. English is the default; the choice is a harmless UI
 * preference, so it lives in localStorage like the theme.
 *
 * The signal changes only after the translation file is loaded, so anything
 * that reacts to it (charts, calendar) can call translate() synchronously.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);

  private readonly current = signal<Language>(DEFAULT_LANGUAGE);
  readonly language = this.current.asReadonly();
  readonly locale = computed(() => LOCALES[this.current()]);

  /** Called once from provideAppInitializer, before the first render. */
  init(): Promise<void> {
    return this.setLanguage(this.readSaved());
  }

  async setLanguage(language: Language): Promise<void> {
    await firstValueFrom(this.transloco.load(language));
    this.transloco.setActiveLang(language);
    this.document.documentElement.lang = language;
    this.current.set(language);
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // storage unavailable (private mode) — the choice just isn't remembered
    }
  }

  translate(key: string, params?: Record<string, unknown>): string {
    return this.transloco.translate(key, params);
  }

  private readSaved(): Language {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (LANGUAGES.some((l) => l.value === saved)) {
        return saved as Language;
      }
    } catch {
      // ignore
    }
    return DEFAULT_LANGUAGE;
  }
}
