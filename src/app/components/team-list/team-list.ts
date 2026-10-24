import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-team-list',
  imports: [
    CommonModule,
    
  ],
  templateUrl: './team-list.html',
  styleUrl: './team-list.scss',
})
export class TeamListComponent {
  team = [
    { name: 'Алексей Климов', role: 'Frontend', initials: 'АК', color: '#4776E6', done: 3, inProgress: 1 },
    { name: 'Михаил Петров', role: 'Backend', initials: 'МП', color: '#00B8D9', done: 2, inProgress: 1 },
    { name: 'Дарья Волкова', role: 'Design', initials: 'ДВ', color: '#8E54E9', done: 1, inProgress: 0 }
  ];
}
