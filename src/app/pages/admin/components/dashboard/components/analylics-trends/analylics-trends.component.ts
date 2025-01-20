import { Component } from '@angular/core';
import { AgCharts } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';

@Component({
  selector: 'admin-dashboard-analylics-trends',
  imports: [AgCharts],
  templateUrl: './analylics-trends.component.html',
  styleUrl: './analylics-trends.component.scss',
})
export class AnalylicsTrendsComponent {
  chartOptions: AgChartOptions = {
    data: [
      { month: 'Jan', userRegistrations: 150 },
      { month: 'Feb', userRegistrations: 200 },
      { month: 'Mar', userRegistrations: 250 },
      { month: 'Apr', userRegistrations: 300 },
      { month: 'May', userRegistrations: 350 },
      { month: 'Jun', userRegistrations: 400 },
      { month: 'Jul', userRegistrations: 450 },
      { month: 'Aug', userRegistrations: 500 },
      { month: 'Sep', userRegistrations: 550 },
      { month: 'Oct', userRegistrations: 600 },
      { month: 'Nov', userRegistrations: 650 },
      { month: 'Dec', userRegistrations: 700 },
    ],

    series: [
      {
        type: 'line',
        xKey: 'month',
        yKey: 'userRegistrations',
        stroke: '#1f77b4',
        marker: {
          enabled: true,
          shape: 'circle',
          size: 6,
          fill: '#1f77b4',
          stroke: '#1f77b4',
        },
      },
    ],
  };

  contentTypes: AgChartOptions = {
    data: [
      { type: 'Publications', count: 120 },
      { type: 'Projects', count: 80 },
      { type: 'Patents', count: 50 },
    ],

    series: [
      {
        type: 'pie',
        angleKey: 'count',
        fills: ['#1f77b4', '#ff7f0e', '#2ca02c'],
        strokes: ['#1f77b4', '#ff7f0e', '#2ca02c'],
        calloutLabelKey: 'type',
        calloutLabel: {
          enabled: true,
        },
        sectorLabelKey: 'count',
        sectorLabel: {
          enabled: true,
          color: 'white',
          fontWeight: 'bold',
        },
      },
    ],
    title: {
      text: 'Content Types Distribution',
    },
    legend: {
      enabled: true,
    },
  };
}
