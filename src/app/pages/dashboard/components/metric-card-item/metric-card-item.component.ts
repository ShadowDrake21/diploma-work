import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardMetricCardItem } from '@shared/types/dashboard.types';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'dashboard-metric-card-item',
  imports: [CommonModule, RouterLink, MatIcon],
  templateUrl: './metric-card-item.component.html',
  styleUrl: './metric-card-item.component.scss',
  host: {
    style: 'display: flex; height: 100%;',
  },
})
export class MetricCardItemComponent {
  data = input.required<DashboardMetricCardItem>();
}
