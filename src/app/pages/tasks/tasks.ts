import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../../components/sidebar/sidebar";
import { HeaderComponent } from "../../components/header/header";
import { StatCardComponent } from "../../components/stat-card/stat-card";
import { TaskDto, TaskStatisticsDto, TasksControllerService } from '../../api';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-tasks',
  imports: [SidebarComponent, HeaderComponent, StatCardComponent, DatePipe], 
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class TasksComponent implements OnInit{
  tasks: TaskDto[] = [];
  filteredTasks: TaskDto[] = [];
  activeFilter: string = 'ALL';

  stats: TaskStatisticsDto = {
    totalTasks: 0,
    notStartedTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0
  };

  currentDate = new Date(); 

  constructor(private taskService: TasksControllerService){}
  
  ngOnInit(): void {
    this.loadTasks();
    this.loadStatistics();
  }

  loadTasks(): void{
    this.taskService.getMyTasks({page: 0, size: 20}).subscribe({
      next: (data) => {
        this.tasks = data;
        this.applyFilter(this.activeFilter);
      },
      error: (err) => console.error('Ошибка загрузки задач:', err)
    });
  }

  loadStatistics(): void {
    this.taskService.getMyStatistics().subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Ошибка загрузки статистики:', err)
    });
  }

  get progressPercentage(): number {
    if (!this.stats || !this.stats.totalTasks) return 0;
    return Math.round((this.stats.completedTasks! / this.stats.totalTasks) * 100);
  }

  applyFilter(filter: string): void {
    this.activeFilter = filter;
    
    if (filter === 'ALL') {
      this.filteredTasks = this.tasks;
    } else {
      this.filteredTasks = this.tasks.filter(task => task.status === filter);
    }
  }
}