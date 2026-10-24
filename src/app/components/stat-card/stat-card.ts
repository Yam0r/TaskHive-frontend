import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  imports: [
    MatIconModule, 
    CommonModule,
  ],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCardComponent {
  @Input() title: string = 'TITLE';
  @Input() count: number | string = 0;
  @Input() iconName: string = 'info';

  @Input() colorType: 'primary' | 'warning' | 'info' | 'success' = 'primary';
trendText: any;
}
