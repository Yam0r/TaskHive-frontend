import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';

import { ProjectService } from '../../api/api/project.service';
import { TasksService } from '../../api/api/tasks.service';
import { UsersService } from '../../api/api/users.service';
import { ProjectDto } from '../../api/model/projectDto';
import { UserResponseDto } from '../../api/model/userResponseDto';
import { TaskDto } from '../../api/model/taskDto';
import { UpdateTaskRequestDto } from '../../api/model/updateTaskRequestDto';

export type TaskStatus = NonNullable<TaskDto['status']>;
export const TASK_STATUSES: TaskStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];

export interface TaskDraft {
  name: string;
  description?: string;
  dueDate: string;
  status: TaskStatus;
  projectId: number;
}

// The backend paginates; one big page is enough for a personal task list.
const PAGE_SIZE = 500;

/** Today as yyyy-MM-dd in the user's time zone (dueDate has no time part). */
export function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isOverdue(task: TaskDto): boolean {
  return task.status !== 'COMPLETED' && !!task.dueDate && task.dueDate < todayIso();
}

/**
 * Single source of truth for the current user's tasks and projects.
 * Pages read the signals; every change goes through the API first and the
 * local state is updated only with what the server accepted.
 */
@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly tasksApi = inject(TasksService);
  private readonly projectsApi = inject(ProjectService);
  private readonly usersApi = inject(UsersService);

  private readonly _tasks = signal<TaskDto[]>([]);
  private readonly _projects = signal<ProjectDto[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal(false);
  private readonly _me = signal<UserResponseDto | null>(null);

  readonly tasks = this._tasks.asReadonly();
  readonly projects = this._projects.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly me = this._me.asReadonly();

  readonly stats = computed(() => {
    const tasks = this._tasks();
    const count = (status: TaskStatus) => tasks.filter((t) => t.status === status).length;
    return {
      total: tasks.length,
      notStarted: count('NOT_STARTED'),
      inProgress: count('IN_PROGRESS'),
      completed: count('COMPLETED'),
      overdue: tasks.filter(isOverdue).length,
    };
  });

  private pending: Promise<void> | null = null;

  /**
   * Loads tasks, projects and the current user. Safe to call from every page:
   * calls made while a load is running share it instead of sending duplicates.
   */
  load(): Promise<void> {
    this.pending ??= this.fetchAll().finally(() => (this.pending = null));
    return this.pending;
  }

  private async fetchAll(): Promise<void> {
    this._loading.set(true);
    this._error.set(false);
    try {
      const { tasks, projects, me } = await firstValueFrom(
        forkJoin({
          tasks: this.tasksApi.getMyTasks(0, PAGE_SIZE),
          projects: this.projectsApi.retrieveUsersProjects(0, PAGE_SIZE),
          me: this.usersApi.getMyProfileInfo(),
        }),
      );
      this._tasks.set(tasks);
      this._projects.set(projects);
      this._me.set(me);
    } catch {
      this._error.set(true); // 401 is handled globally by authInterceptor
    } finally {
      this._loading.set(false);
    }
  }

  /** Each project with how many of its tasks (assigned to me) are done. */
  readonly projectProgress = computed(() =>
    this._projects().map((project) => {
      const tasks = this._tasks().filter((t) => t.projectId === project.id);
      const done = tasks.filter((t) => t.status === 'COMPLETED').length;
      return {
        project,
        total: tasks.length,
        done,
        percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
      };
    }),
  );

  /** Forget everything on logout, so the next user never sees these tasks. */
  reset(): void {
    this._tasks.set([]);
    this._projects.set([]);
    this._me.set(null);
    this._error.set(false);
  }

  projectName(projectId: number | undefined): string | undefined {
    return this._projects().find((p) => p.id === projectId)?.name;
  }

  async createProject(name: string): Promise<ProjectDto> {
    const project = await firstValueFrom(this.projectsApi.createANewProject({ name }));
    this._projects.update((list) => [...list, project]);
    return project;
  }

  async createTask(draft: TaskDraft): Promise<TaskDto> {
    const userId = this._me()?.id;
    if (userId === undefined) {
      throw new Error('User profile is not loaded');
    }
    const created = await firstValueFrom(
      this.tasksApi.createANewTask({ ...draft, assigneeId: userId }),
    );
    // The create response may not echo projectId, keep the one we sent
    const task: TaskDto = { ...created, projectId: created.projectId ?? draft.projectId };
    this._tasks.update((list) => [...list, task]);
    return task;
  }

  /** PUT sends only the changed fields: the backend ignores nulls (partial update). */
  async updateTask(id: number, changes: UpdateTaskRequestDto): Promise<void> {
    await firstValueFrom(this.tasksApi.updateTask(id, changes));
    this._tasks.update((list) => list.map((t) => (t.id === id ? { ...t, ...changes } : t)));
  }

  async deleteTask(id: number): Promise<void> {
    await firstValueFrom(this.tasksApi.deleteTask(id));
    this._tasks.update((list) => list.filter((t) => t.id !== id));
  }

  nextStatus(status: TaskStatus | undefined): TaskStatus {
    const index = TASK_STATUSES.indexOf(status ?? 'NOT_STARTED');
    return TASK_STATUSES[(index + 1) % TASK_STATUSES.length];
  }
}
