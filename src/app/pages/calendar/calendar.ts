import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { CalendarOptions, FullCalendarModule } from '@fullcalendar/angular';
import themePlugin from '@fullcalendar/angular/themes/monarch';
import interactionPlugin from '@fullcalendar/angular/interaction';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
// Imported from 'fullcalendar' directly: the locales/* export of @fullcalendar/angular 7.1.5 is broken.
import csLocale from 'fullcalendar/locales/cs';
import ruLocale from 'fullcalendar/locales/ru';

import { HeaderComponent } from '../../components/header/header';
import { TaskDialogComponent } from '../../components/task-dialog/task-dialog';
import { TaskDto } from '../../api/model/taskDto';
import { Language, LanguageService } from '../../core/i18n/language.service';
import { isOverdue, TaskStore } from '../../core/tasks/task-store.service';
import { ThemeService } from '../../core/theme/theme.service';

// English is FullCalendar's built-in default
const CALENDAR_LOCALES: Record<Language, string | typeof ruLocale> = {
  en: 'en',
  ru: ruLocale,
  cs: csLocale,
};

/** Task colour = status, red = overdue (CSS tokens, re-read on theme change). */
const STATUS_TOKENS = {
  NOT_STARTED: '--color-accent',
  IN_PROGRESS: '--color-info',
  COMPLETED: '--color-success',
} as const;

@Component({
  selector: 'app-calendar',
  imports: [TranslocoPipe, HeaderComponent, FullCalendarModule, TaskDialogComponent],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class CalendarComponent implements OnInit {
  private readonly store = inject(TaskStore);
  private readonly languageService = inject(LanguageService);
  private readonly themeService = inject(ThemeService);

  /** First day of the month shown in the calendar, as yyyy-MM. */
  private readonly visibleMonth = signal('');

  readonly deadlinesThisMonth = computed(
    () => this.store.tasks().filter((t) => t.dueDate?.startsWith(this.visibleMonth())).length,
  );
  readonly overdue = computed(() => this.store.stats().overdue);
  readonly loadError = this.store.error;

  // Dialog state: a task to edit, or a date for a new task
  readonly dialogOpen = signal(false);
  readonly dialogTask = signal<TaskDto | null>(null);
  readonly dialogDate = signal<string | null>(null);

  /** Rebuilt when tasks, language or theme change (computed, so the template always re-renders). */
  readonly calendarOptions = computed<CalendarOptions>(() => {
    const css = (name: string) => this.themeService.cssVar(name);
    this.themeService.theme();

    return {
      plugins: [themePlugin, interactionPlugin, dayGridPlugin],
      initialView: 'dayGridMonth',
      locale: CALENDAR_LOCALES[this.languageService.language()],
      firstDay: 1,
      headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' },
      height: 'auto',
      editable: true, // drag a task to another day = change its due date
      eventDurationEditable: false,
      dayMaxEvents: 3,
      events: this.store
        .tasks()
        .filter((t) => t.dueDate)
        .map((t) => {
          const color = css(isOverdue(t) ? '--color-danger' : STATUS_TOKENS[t.status ?? 'NOT_STARTED']);
          return {
            id: String(t.id),
            title: t.name,
            start: t.dueDate,
            allDay: true,
            color, // FullCalendar 7: `color` replaces backgroundColor/borderColor
            contrastColor: css('--color-on-accent'),
            className: t.status === 'COMPLETED' ? 'task-done' : '',
          };
        }),
      dateClick: (info) => this.openCreate(info.dateStr),
      eventClick: (info) => this.openEdit(Number(info.event.id)),
      eventDrop: (info) => this.moveTask(Number(info.event.id), info.event.startStr, info.revert),
      datesSet: (info) => this.visibleMonth.set(this.monthOf(info.view.currentStart)),
    };
  });

  ngOnInit(): void {
    this.store.load();
  }

  openCreate(date: string | null = null): void {
    this.dialogTask.set(null);
    this.dialogDate.set(date);
    this.dialogOpen.set(true);
  }

  openEdit(id: number): void {
    const task = this.store.tasks().find((t) => t.id === id);
    if (!task) return;
    this.dialogTask.set(task);
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
  }

  private async moveTask(id: number, dueDate: string, revert: () => void): Promise<void> {
    try {
      await this.store.updateTask(id, { dueDate: dueDate.slice(0, 10) });
    } catch {
      revert(); // the server refused, put the task back where it was
    }
  }

  private monthOf(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}
