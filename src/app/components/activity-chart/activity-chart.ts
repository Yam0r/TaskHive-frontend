import { Component, effect, inject } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { TranslocoPipe } from '@jsverse/transloco';
import { ThemeService } from '../../core/theme/theme.service';
import { LanguageService } from '../../core/i18n/language.service';

@Component({
  selector: 'app-activity-chart',
  standalone: true,
  imports: [
    BaseChartDirective,
    TranslocoPipe,
  ],
  templateUrl: './activity-chart.html',
  styleUrl: './activity-chart.scss'
})
export class ActivityChartComponent {
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);

  public barChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {};

  constructor() {
    // Chart.js draws on a canvas and can't use CSS variables directly,
    // so colors are re-read from the theme tokens whenever the theme changes.
    // Labels are re-read when the language changes.
    effect(() => {
      this.themeService.theme();
      this.languageService.language();
      this.applyTheme();
    });
  }

  private applyTheme(): void {
    const css = (name: string) => this.themeService.cssVar(name);
    const muted = css('--color-text-muted');
    const t = (key: string) => this.languageService.translate(key);

    this.barChartData = {
      labels: this.weekdayLabels(),
      datasets: [
        {
          data: [3, 5, 2, 7, 4, 1, 0],
          label: t('activity.created'),
          backgroundColor: css('--color-accent'),
          borderRadius: 4,
          barPercentage: 0.6,
          categoryPercentage: 0.8
        },
        {
          data: [2, 4, 1, 5, 6, 2, 1],
          label: t('activity.completed'),
          backgroundColor: css('--color-success'),
          borderRadius: 4,
          barPercentage: 0.6,
          categoryPercentage: 0.8
        }
      ]
    };

    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: muted }
        },
        y: {
          grid: { color: css('--color-border') },
          ticks: { color: muted, stepSize: 2 }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: muted,
            usePointStyle: true,
            boxWidth: 8
          }
        },
        tooltip: {
          backgroundColor: css('--color-surface-active'),
          titleColor: css('--color-text'),
          bodyColor: css('--color-text'),
          cornerRadius: 8
        }
      }
    };
  }

  /** Short weekday names Mon..Sun in the current language (from Intl, no translation files needed). */
  private weekdayLabels(): string[] {
    const format = new Intl.DateTimeFormat(this.languageService.locale(), { weekday: 'short' });
    // 2024-01-01 was a Monday
    return Array.from({ length: 7 }, (_, i) => format.format(new Date(2024, 0, 1 + i)));
  }
}
