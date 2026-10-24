import { Component } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-activity-chart',
  standalone: true,
  imports: [
    BaseChartDirective
  ],
  templateUrl: './activity-chart.html',
  styleUrl: './activity-chart.scss'
})
export class ActivityChartComponent {
  
  
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    datasets: [
      {
        data: [3, 5, 2, 7, 4, 1, 0],
        label: 'Создано',
        backgroundColor: '#8E54E9',
        borderRadius: 4,            
        barPercentage: 0.6,         
        categoryPercentage: 0.8     
      },
      {
        data: [2, 4, 1, 5, 6, 2, 1],
        label: 'Выполнено',
        backgroundColor: '#22c55e',
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.8
      }
    ]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false, 
    scales: {
      x: {
        grid: { display: false }, 
        ticks: { color: '#9CA3AF' } 
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
        ticks: { color: '#9CA3AF', stepSize: 2 }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end', 
        labels: {
          color: '#9CA3AF',
          usePointStyle: true, 
          boxWidth: 8
        }
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