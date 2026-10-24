import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { HeaderComponent } from '../../components/header/header';
import { StatCardComponent } from '../../components/stat-card/stat-card';
import { ActivityChartComponent } from "../../components/activity-chart/activity-chart";
import { StatusChartComponent } from "../../components/status-chart/status-chart";
import { DeadlineListComponent } from "../../components/deadline-list/deadline-list";
import { TeamListComponent } from "../../components/team-list/team-list";

import { TaskStatisticsDto } from '../../api/model/taskStatisticsDto';
import { TasksControllerService } from '../../api/api/tasksController.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    SidebarComponent,
    HeaderComponent,
    StatCardComponent,
    ActivityChartComponent,
    StatusChartComponent,
    DeadlineListComponent,
    TeamListComponent
],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit{
  stats: TaskStatisticsDto = {
    totalTasks: 0,
    notStartedTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0
  };
  
  constructor(private taskService: TasksControllerService){

  }

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(){
    this.taskService.getMyStatistics()
      .subscribe({
        next: (data) => {
          this.stats = data;
        },
        error: (err) => console.error('Error:', err)
      })
  }
}
