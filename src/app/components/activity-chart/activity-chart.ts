import { Component, computed, inject } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { TranslocoPipe } from '@jsverse/transloco';

import { TaskDto } from '../../api/model/taskDto';
import { LanguageService } from '../../core/i18n/language.service';
import { isOverdue, TASK_STATUSES, TaskStore, todayIso } from '../../core/tasks/task-store.service';
import { ThemeService } from '../../core/theme/theme.service';

const STATUS_TOKENS = {
  NOT_STARTED: '--color-accent',
  IN_PROGRESS: '--color-info',
  COMPLETED: '--color-success',
} as const;

/**
 * The week ahead: tasks due on each of the next 7 days, stacked by status,
 * plus one "overdue" column. Built only from due dates, which the backend has
 * today; a real created/completed activity chart needs timestamps on the backend.
 */
@Component({
  selector: 'app-activity-chart',
  imports: [BaseChartDirective, TranslocoPipe],
  templateUrl: './activity-chart.html',
  styleUrl: './activity-chart.scss',
})
export class ActivityChartComponent {
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);
  private readonly store = inject(TaskStore);

  /**
   * computed(), not a field set in effect(): with zoneless change detection a
   * plain field change doesn't re-render the template, a signal does.
   * Re-runs when the theme (canvas can't read CSS variables), the language or the tasks change.
   */
  readonly chart = computed(() => {
    this.themeService.theme();
    this.languageService.language();
    return this.build(this.store.tasks());
  });

  private build(tasks: TaskDto[]): {
    data: ChartConfiguration<'bar'>['data'];
    options: ChartConfiguration<'bar'>['options'];
  } {
    const css = (name: string) => this.themeService.cssVar(name);
    const t = (key: string) => this.languageService.translate(key);
    const muted = css('--color-text-muted');
    const days = this.nextSevenDays();

    const data: ChartConfiguration<'bar'>['data'] = {
      labels: [t('activity.overdue'), ...days.map((d) => d.label)],
      datasets: TASK_STATUSES.map((status) => ({
        label: t('status.' + status),
        data: [
          // Overdue column: only open tasks can be overdue
          tasks.filter((task) => task.status === status && isOverdue(task)).length,
          ...days.map((d) => tasks.filter((task) => task.status === status && task.dueDate === d.iso).length),
        ],
        backgroundColor: css(STATUS_TOKENS[status]),
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
        maxBarThickness: 36,
      })),
    };

    const options: ChartConfiguration<'bar'>['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { color: muted } },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { color: css('--color-border') },
          ticks: { color: muted, precision: 0 },
        },
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { color: muted, usePointStyle: true, boxWidth: 8 },
        },
        tooltip: {
          backgroundColor: css('--color-surface-active'),
          titleColor: css('--color-text'),
          bodyColor: css('--color-text'),
          cornerRadius: 8,
        },
      },
    };
    return { data, options };
  }

  /** Today and the 6 following days: ISO date for matching, short label for the axis. */
  private nextSevenDays(): { iso: string; label: string }[] {
    const format = new Intl.DateTimeFormat(this.languageService.locale(), { weekday: 'short', day: 'numeric' });
    const [y, m, d] = todayIso().split('-').map(Number);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(y, m - 1, d + i);
      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return { iso, label: format.format(date) };
    });
  }
}
