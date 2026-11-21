import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TasksControllerService } from '../../api/api/tasksController.service';
import { TaskDto } from '../../api/model/taskDto';

@Component({
  selector: 'app-deadline-list',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './deadline-list.html',
  styleUrl: './deadline-list.scss',
})
export class DeadlineListComponent implements OnInit {
  private taskService = inject(TasksControllerService);
  tasks = signal<TaskDto[]>([]);

  ngOnInit(): void {
    this.taskService.getMyTasks({ page: 0, size: 100 }).subscribe({
      next: (data) => this.tasks.set(this.upcoming(data)),
      error: (err) => console.error('Ошибка загрузки дедлайнов:', err),
    });
  }

  private upcoming(tasks: TaskDto[]): TaskDto[] {
    return tasks
      .filter(t => t.dueDate && t.status !== TaskDto.StatusEnum.Completed)
      .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
      .slice(0, 5);
  }

  isOverdue(task: TaskDto): boolean {
    const today = new Date().toISOString().slice(0, 10);
    return task.dueDate! < today;
  }
}