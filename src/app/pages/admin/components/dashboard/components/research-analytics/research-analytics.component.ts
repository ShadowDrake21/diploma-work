import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { AnalyticsService } from '@core/services/analytics.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-research-analytics',
  imports: [MatCardModule, MatGridListModule, NgxChartsModule],
  templateUrl: './research-analytics.component.html',
  styleUrl: './research-analytics.component.scss',
})
export class ResearchAnalyticsComponent {
  private readonly analyticsService = inject(AnalyticsService);

  researchFunding = this.analyticsService.researchFunding;
  publicationMetrics = this.analyticsService.publicationMetrics;
  patentMetrics = this.analyticsService.patentMetrics;
}
