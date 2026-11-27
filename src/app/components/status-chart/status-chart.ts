import { Component, effect, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { TaskStatisticsDto } from '../../api/model/taskStatisticsDto';
import { TranslocoPipe } from '@jsverse/transloco';
import { ThemeService } from '../../core/theme/theme.service';
import { LanguageService } from '../../core/i18n/language.service';

@Component({
  selector: 'app-status-chart',
  imports: [
    BaseChartDirective,
    TranslocoPipe,
  ],
  standalone: true,
  templateUrl: './status-chart.html',
  styleUrl: './status-chart.scss',
})
export class StatusChartComponent implements OnChanges {
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);

  @Input() stats: TaskStatisticsDto = {
    totalTasks: 0,
    notStartedTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0
  };

  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };
  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {};

  constructor() {
    // Canvas charts can't use CSS variables, so re-read the tokens on every theme change.
    // Labels follow the current language.
    effect(() => {
      this.themeService.theme();
      this.languageService.language();
      this.updateChartData();
      this.updateChartOptions();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stats'] && changes['stats'].currentValue) {
      this.updateChartData();
    }
  }

  get completionPercentage(): number {
    if (!this.stats || !this.stats.totalTasks) {
      return 0;
    }
    return Math.round((this.stats.completedTasks! / this.stats.totalTasks) * 100);
  }

  private updateChartData(): void {
    const css = (name: string) => this.themeService.cssVar(name);
    this.doughnutChartData = {
      labels: ['status.COMPLETED', 'status.IN_PROGRESS', 'status.NOT_STARTED'].map((key) =>
        this.languageService.translate(key),
      ),
      datasets: [
        {
          data: [
            this.stats.completedTasks || 0,
            this.stats.inProgressTasks || 0,
            this.stats.notStartedTasks || 0
          ],
          backgroundColor: [css('--color-success'), css('--color-info'), css('--color-accent')],
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    };
  }

  private updateChartOptions(): void {
    const css = (name: string) => this.themeService.cssVar(name);
    this.doughnutChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: {
          display: false
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
