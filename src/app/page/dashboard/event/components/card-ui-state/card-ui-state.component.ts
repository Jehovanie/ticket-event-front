import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ChartDoughnutType } from '../state-event/state-event.component';

@Component({
  selector: 'app-card-ui-state',
  imports: [BaseChartDirective, CommonModule],
  templateUrl: './card-ui-state.component.html',
  styleUrl: './card-ui-state.component.css',
})
export class CardUiStateComponent implements OnInit {
  @Input() dataState!: ChartDoughnutType;

  doughnutChartLabels: string[] = [];
  doughuntChartDatasetData: number[] = [];
  doughuntChartDatasetColor: string[] = [];

  doughnutChartData: ChartData<'doughnut'> = {
    labels: this.doughnutChartLabels,
    datasets: [
      {
        data: [350, 450, 100],
      },
    ],
  };

  chartOptions = {
    responsive: true,
    cutout: '60%',
    plugins: {
      legend: {
        display: false, // on gère nous-mêmes la légende à gauche
      },
    },
  };

  doughnutChartType: ChartType = 'doughnut';

  ngOnInit() {
    console.log('dataState', this.dataState);
    this.initAllData();
  }

  initAllData() {
    this.dataState.state.forEach((item) => {
      const [key] = Object.keys(item);
      this.doughnutChartLabels.push(key.toUpperCase());
      this.doughuntChartDatasetData.push(item[key]['count']);
      this.doughuntChartDatasetColor.push(item[key]['color']);
    });

    this.doughnutChartData = {
      labels: this.doughnutChartLabels,
      datasets: [
        {
          data: this.doughuntChartDatasetData,
          backgroundColor: this.doughuntChartDatasetColor,
        },
      ],
    };
  }
}
