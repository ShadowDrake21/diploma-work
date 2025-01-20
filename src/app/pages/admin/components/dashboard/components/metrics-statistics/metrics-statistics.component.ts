import { Component } from '@angular/core';
import { MetricCardItemComponent } from '../../../../../../shared/components/metric-card-item/metric-card-item.component';
import {
  AdminContentMetrics,
  AdminEngagementMetrics,
  AdminUserMetrics,
} from '@content/admin.content';

@Component({
  selector: 'admin-dashboard-metrics-statistics',
  imports: [MetricCardItemComponent],
  templateUrl: './metrics-statistics.component.html',
  styleUrl: './metrics-statistics.component.scss',
})
export class MetricsStatisticsComponent {
  userMetrics = AdminUserMetrics;
  contentMetrics = AdminContentMetrics;
  engagementMetrics = AdminEngagementMetrics;
}
