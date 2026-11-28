import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { TaskStore } from '../../core/tasks/task-store.service';

/** The user's projects with progress: how many of their tasks are done. */
@Component({
  selector: 'app-project-list',
  imports: [TranslocoPipe, RouterLink],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
})
export class ProjectListComponent {
  readonly projects = inject(TaskStore).projectProgress;
}
