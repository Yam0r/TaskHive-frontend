import { Component, effect, inject } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-activity-chart',
  standalone: true,
  imports: [
    BaseChartDirective
  ],
  templateUrl: './activity-chart.html',
  styleUrl: './activity-chart.scss'
})
export class ActivityChartComponent {
  private readonly themeService = inject(ThemeService);

  public barChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {};

  constructor() {
    // Chart.js draws on a canvas and can't use CSS variables directly,
    // so colors are re-read from the theme tokens whenever the theme changes.
    effect(() => {
      this.themeService.theme();
      this.applyTheme();
    });
  }

  private applyTheme(): void {
    const css = (name: string) => this.themeService.cssVar(name);
    const muted = css('--color-text-muted');

    this.barChartData = {
      labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      datasets: [
        {
          data: [3, 5, 2, 7, 4, 1, 0],
          label: 'Создано',
          backgroundColor: css('--color-accent'),
          borderRadius: 4,
          barPercentage: 0.6,
          categoryPercentage: 0.8
        },
        {
          data: [2, 4, 1, 5, 6, 2, 1],
          label: 'Выполнено',
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
}
