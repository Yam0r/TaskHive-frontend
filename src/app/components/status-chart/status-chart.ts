import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { TaskStatisticsDto } from '../../api/model/taskStatisticsDto';

@Component({
  selector: 'app-status-chart',
  imports: [
    BaseChartDirective,

  ],
  standalone: true,
  templateUrl: './status-chart.html',
  styleUrl: './status-chart.scss',
})
export class StatusChartComponent implements OnChanges{
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stats'] && changes['stats'].currentValue) {
      this.updateChartData();
    }
  }

  @Input() stats: TaskStatisticsDto = {
    totalTasks: 0,
    notStartedTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0
  };

  private updateChartData(): void {
    this.doughnutChartData = {
      labels: ['Готово', 'В процессе', 'К выполнению'],
      datasets: [
        {
          data: [
            this.stats.completedTasks || 0,
            this.stats.inProgressTasks || 0,
            this.stats.notStartedTasks || 0
          ],
          backgroundColor: ['#22c55e', '#00B8D9', '#8E54E9'],
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    };
  }

  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Готово', 'В процессе', 'К выполнению'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#22c55e', '#00B8D9', '#8E54E9'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  get completionPercentage(): number{
    if(!this.stats || this.stats.totalTasks === 0){
      return 0;
    }
    return Math.round((this.stats.completedTasks! / this.stats.totalTasks!) * 100);
  }
  
  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#2a2d45',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8
      }
    }
  };
}
