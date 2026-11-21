import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'taskhive.theme';

/**
 * Holds the current color theme and applies it to <html data-theme="...">.
 * The choice is stored in localStorage: it is a harmless UI preference,
 * not sensitive data. Without a saved choice the OS preference is used.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly current = signal<Theme>(this.readInitialTheme());

  /** Read-only signal: components can react to theme changes (e.g. charts). */
  readonly theme = this.current.asReadonly();

  constructor() {
    this.apply(this.current());
  }

  setTheme(theme: Theme): void {
    this.apply(theme);
    this.current.set(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable (private mode); the theme still works for this session.
    }
  }

  toggle(): void {
    this.setTheme(this.current() === 'dark' ? 'light' : 'dark');
  }

  /** Reads a design token, e.g. cssVar('--color-text'). Used where CSS can't reach (Chart.js). */
  cssVar(name: string): string {
    return getComputedStyle(this.document.documentElement).getPropertyValue(name).trim();
  }

  private apply(theme: Theme): void {
    // Set the attribute before the signal changes, so anyone reacting to the
    // signal already sees the new CSS variable values.
    this.document.documentElement.dataset['theme'] = theme;
  }

  private readInitialTheme(): Theme {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {
      // ignore, fall back to the OS preference
    }
    const prefersLight = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: light)').matches;
    return prefersLight ? 'light' : 'dark';
  }
}
