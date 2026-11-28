import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { TaskDto } from '../../api/model/taskDto';
import { LanguageService } from '../../core/i18n/language.service';
import { isOverdue, TaskStore } from '../../core/tasks/task-store.service';

/** Five nearest deadlines among tasks that are not done (overdue ones first). */
@Component({
  selector: 'app-deadline-list',
  imports: [TranslocoPipe, DatePipe, RouterLink],
  templateUrl: './deadline-list.html',
  styleUrl: './deadline-list.scss',
})
export class DeadlineListComponent {
  private readonly store = inject(TaskStore);
  readonly locale = inject(LanguageService).locale;

  readonly tasks = computed(() =>
    this.store
      .tasks()
      .filter((t) => t.dueDate && t.status !== 'COMPLETED')
      .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
      .slice(0, 5),
  );

  isOverdue(task: TaskDto): boolean {
    return isOverdue(task);
  }

  projectName(task: TaskDto): string | undefined {
    return this.store.projectName(task.projectId);
  }
}
