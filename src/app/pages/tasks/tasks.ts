import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

import { HeaderComponent } from '../../components/header/header';
import { StatCardComponent } from '../../components/stat-card/stat-card';
import { TaskDialogComponent } from '../../components/task-dialog/task-dialog';
import { TaskDto } from '../../api/model/taskDto';
import { LanguageService } from '../../core/i18n/language.service';
import { isOverdue, TASK_STATUSES, TaskStatus, TaskStore } from '../../core/tasks/task-store.service';

type Filter = 'ALL' | TaskStatus;

@Component({
  selector: 'app-tasks',
  imports: [TranslocoPipe, HeaderComponent, StatCardComponent, DatePipe, TaskDialogComponent],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class TasksComponent implements OnInit {
  private readonly store = inject(TaskStore);
  readonly locale = inject(LanguageService).locale;

  readonly filters: Filter[] = ['ALL', ...TASK_STATUSES];
  readonly activeFilter = signal<Filter>('ALL');
  readonly stats = this.store.stats;
  readonly loading = this.store.loading;
  readonly loadError = this.store.error;
  readonly updatingId = signal<number | null>(null);

  readonly dialogOpen = signal(false);
  readonly dialogTask = signal<TaskDto | null>(null);

  /** Open tasks first, then by due date (no date last). */
  readonly visibleTasks = computed(() => {
    const filter = this.activeFilter();
    return this.store
      .tasks()
      .filter((t) => filter === 'ALL' || t.status === filter)
      .sort((a, b) => {
        const doneA = a.status === 'COMPLETED' ? 1 : 0;
        const doneB = b.status === 'COMPLETED' ? 1 : 0;
        return doneA - doneB || (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999');
      });
  });

  readonly progressPercentage = computed(() => {
    const { total, completed } = this.stats();
    return total ? Math.round((completed / total) * 100) : 0;
  });

  ngOnInit(): void {
    this.store.load();
  }

  projectName(task: TaskDto): string | undefined {
    return this.store.projectName(task.projectId);
  }

  isOverdue(task: TaskDto): boolean {
    return isOverdue(task);
  }

  /** Click on the circle: To do -> In progress -> Done -> To do */
  async cycleStatus(task: TaskDto): Promise<void> {
    if (task.id === undefined || this.updatingId() !== null) return;
    this.updatingId.set(task.id);
    try {
      await this.store.updateTask(task.id, { status: this.store.nextStatus(task.status) });
    } catch {
      // state is unchanged on error; the interceptor handles 401
    } finally {
      this.updatingId.set(null);
    }
  }

  openCreate(): void {
    this.dialogTask.set(null);
    this.dialogOpen.set(true);
  }

  openEdit(task: TaskDto): void {
    this.dialogTask.set(task);
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
  }
}
