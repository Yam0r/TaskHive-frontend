import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-deadline-list',
  standalone: true,
  imports: [
    CommonModule,

  ],
  templateUrl: './deadline-list.html',
  styleUrl: './deadline-list.scss',
})
export class DeadlineListComponent {
  tasks = [
    { title: 'Настроить CI/CD пайплайн', category: 'DevOps', date: 'до 05 авг', priority: 'high', priorityText: 'Высокий', active: true },
    { title: 'Написать unit-тесты для авторизации', category: 'Backend', date: 'до 07 авг', priority: 'medium', priorityText: 'Средний', active: true },
    { title: 'Интеграция с платёжной системой', category: 'Backend', date: 'до 10 авг', priority: 'high', priorityText: 'Высокий', active: false },
    { title: 'Оптимизация SQL-запросов', category: 'Database', date: 'до 12 авг', priority: 'medium', priorityText: 'Средний', active: false }
  ];
}
