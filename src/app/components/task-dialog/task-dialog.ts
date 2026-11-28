import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

import { TaskDto } from '../../api/model/taskDto';
import { LanguageService } from '../../core/i18n/language.service';
import { TASK_STATUSES, TaskStatus, TaskStore, todayIso } from '../../core/tasks/task-store.service';

/** Value of the project <select> that switches to "create a new project". */
const NEW_PROJECT = -1;

/**
 * Create or edit a task. Only fields the backend actually has
 * (CreateTaskRequestDto / UpdateTaskRequestDto); the assignee is the current user.
 */
@Component({
  selector: 'app-task-dialog',
  imports: [ReactiveFormsModule, TranslocoPipe, MatIconModule],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.scss',
})
export class TaskDialogComponent implements OnInit, AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(TaskStore);
  private readonly languageService = inject(LanguageService);

  /** Task to edit; when empty the dialog creates a new task. */
  readonly task = input<TaskDto | null>(null);
  /** Due date suggested for a new task (yyyy-MM-dd), e.g. the clicked calendar day. */
  readonly date = input<string | null>(null);
  readonly closed = output<void>();

  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  readonly projects = this.store.projects;
  readonly statuses = TASK_STATUSES;
  readonly NEW_PROJECT = NEW_PROJECT;
  readonly saving = signal(false);
  readonly confirmDelete = signal(false);
  readonly errors = signal<string[]>([]);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    projectId: [0, [Validators.required]],
    newProjectName: ['', [Validators.maxLength(255)]],
    dueDate: ['', [Validators.required]],
    status: ['NOT_STARTED' as TaskStatus],
    description: ['', [Validators.maxLength(1000)]],
  });

  get isEdit(): boolean {
    return !!this.task();
  }

  get creatingProject(): boolean {
    return this.form.controls.projectId.value === NEW_PROJECT;
  }

  ngOnInit(): void {
    const task = this.task();
    if (task) {
      this.form.patchValue({
        name: task.name,
        projectId: task.projectId ?? 0,
        dueDate: task.dueDate ?? '',
        status: task.status ?? 'NOT_STARTED',
        description: task.description ?? '',
      });
      // The backend can't move a task to another project (no projectId in UpdateTaskRequestDto)
      this.form.controls.projectId.disable();
    } else {
      const first = this.projects()[0]?.id;
      this.form.patchValue({
        dueDate: this.date() ?? todayIso(),
        projectId: first ?? NEW_PROJECT,
      });
    }
  }

  ngAfterViewInit(): void {
    this.nameInput()?.nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  close(): void {
    if (!this.saving()) {
      this.closed.emit();
    }
  }

  async save(): Promise<void> {
    if (this.creatingProject && !this.form.controls.newProjectName.value.trim()) {
      this.form.controls.newProjectName.setErrors({ required: true });
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errors.set([]);
    const value = this.form.getRawValue();
    const fields = {
      name: value.name.trim(),
      description: value.description.trim() || undefined,
      dueDate: value.dueDate,
      status: value.status,
    };

    try {
      const task = this.task();
      if (task?.id !== undefined) {
        await this.store.updateTask(task.id, fields);
      } else {
        const projectId = this.creatingProject
          ? (await this.store.createProject(value.newProjectName.trim())).id!
          : value.projectId;
        await this.store.createTask({ ...fields, projectId });
      }
      this.closed.emit();
    } catch (error) {
      this.errors.set(this.toMessages(error));
    } finally {
      this.saving.set(false);
    }
  }

  async remove(): Promise<void> {
    const id = this.task()?.id;
    if (id === undefined) return;
    if (!this.confirmDelete()) {
      this.confirmDelete.set(true); // second click actually deletes
      return;
    }
    this.saving.set(true);
    try {
      await this.store.deleteTask(id);
      this.closed.emit();
    } catch (error) {
      this.errors.set(this.toMessages(error));
    } finally {
      this.saving.set(false);
    }
  }

  /** Backend error format: 400 {"errors": [...]}, others {"error": "..."}. */
  private toMessages(error: unknown): string[] {
    if (error instanceof HttpErrorResponse) {
      if (Array.isArray(error.error?.errors)) return error.error.errors;
      if (typeof error.error?.error === 'string') return [error.error.error];
      if (error.status === 0) return [this.languageService.translate('auth.errors.serverUnavailable')];
    }
    return [this.languageService.translate('auth.errors.generic')];
  }
}
