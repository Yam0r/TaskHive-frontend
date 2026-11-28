import { Component, computed, inject, OnInit } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { HeaderComponent } from '../../components/header/header';
import { StatCardComponent } from '../../components/stat-card/stat-card';
import { ActivityChartComponent } from '../../components/activity-chart/activity-chart';
import { StatusChartComponent } from '../../components/status-chart/status-chart';
import { DeadlineListComponent } from '../../components/deadline-list/deadline-list';
import { ProjectListComponent } from '../../components/project-list/project-list';
import { TaskStatisticsDto } from '../../api/model/taskStatisticsDto';
import { TaskStore } from '../../core/tasks/task-store.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    TranslocoPipe,
    HeaderComponent,
    StatCardComponent,
    ActivityChartComponent,
    StatusChartComponent,
    DeadlineListComponent,
    ProjectListComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  private readonly store = inject(TaskStore);

  readonly loadError = this.store.error;

  /**
   * Counted from the same task list as the other pages, so a status change
   * anywhere shows up here at once (no second request to /tasks/my/statistics).
   */
  readonly stats = computed<TaskStatisticsDto>(() => {
    const s = this.store.stats();
    return {
      totalTasks: s.total,
      notStartedTasks: s.notStarted,
      inProgressTasks: s.inProgress,
      completedTasks: s.completed,
    };
  });

  ngOnInit(): void {
    this.store.load();
  }
}
