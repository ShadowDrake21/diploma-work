import { Component, inject } from '@angular/core';
import {
  AdminContentMetrics,
  AdminEngagementMetrics,
  AdminUserMetrics,
} from '@content/admin.content';
import { MetricCardItemComponent } from '@shared/components/metric-card-item/metric-card-item.component';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { CommentComponent } from '../../../../shared/components/comment/comment.component';
// Angular Chart Component
import { AgCharts } from 'ag-charts-angular';
// Chart Options Type Interface
import { AgChartOptions } from 'ag-charts-community';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface IUserActivities {
  position: number;
  user: string;
  activity: string;
}

const USERS_ACTIVITIES: IUserActivities[] = [
  { position: 1, user: 'Edward D. Drake', activity: 'Updated profile' },
  { position: 2, user: 'Edward D. Drake', activity: 'Updated profile' },
  { position: 3, user: 'Edward D. Drake', activity: 'Updated profile' },
  { position: 4, user: 'Edward D. Drake', activity: 'Updated profile' },
  { position: 5, user: 'Edward D. Drake', activity: 'Updated profile' },
  { position: 6, user: 'Edward D. Drake', activity: 'Updated profile' },
];

export interface INewProjectActivities {
  position: number;
  user: string;
  project: string;
  date: string;
}

const NEW_PROJECTS_ACTIVITIES: INewProjectActivities[] = [
  {
    position: 1,
    user: 'Edward D. Drake',
    project: 'New project 1',
    date: new Date().toISOString(),
  },
  {
    position: 2,
    user: 'Edward D. Drake',
    project: 'New project 2',
    date: new Date().toISOString(),
  },
  {
    position: 3,
    user: 'Edward D. Drake',
    project: 'New project 3',
    date: new Date().toISOString(),
  },
  {
    position: 4,
    user: 'Edward D. Drake',
    project: 'New project 4',
    date: new Date().toISOString(),
  },
  {
    position: 5,
    user: 'Edward D. Drake',
    project: 'New project 5',
    date: new Date().toISOString(),
  },
  {
    position: 6,
    user: 'Edward D. Drake',
    project: 'New project 6',
    date: new Date().toISOString(),
  },
  {
    position: 7,
    user: 'Edward D. Drake',
    project: 'New project 7',
    date: new Date().toISOString(),
  },
];

@Component({
  selector: 'app-dashboard',
  imports: [
    MetricCardItemComponent,
    MatTableModule,
    DatePipe,
    MatListModule,
    CommentComponent,
    AgCharts,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class DashboardComponent {
  private router = inject(Router);
  userMetrics = AdminUserMetrics;
  contentMetrics = AdminContentMetrics;
  engagementMetrics = AdminEngagementMetrics;

  displayedUserActivitiesColumns: string[] = ['user', 'activity'];
  userActivitiesSource = USERS_ACTIVITIES;

  displayedNewProjectsColumns: string[] = ['user', 'project', 'date'];
  NewProjectsSource = NEW_PROJECTS_ACTIVITIES;

  comment = {
    id: 'c1',
    userId: 'u1',
    userName: 'Remigiusz Mróz',
    avatarUrl:
      'https://ocdn.eu/pulscms-transforms/1/CUYk9kuTURBXy9mMDFlODIxMi04NmE2LTRjMWEtYTgzMC01OGQxN2MxYzU5YzYuanBlZ5KaCs0B4M0BDigAAABLFBSTBc0B4M0BDt4AA6EwAaExAaEzww',
    timestamp: '2024-04-25T10:30:00Z',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Velit omnis animi et iure laudantium vitae, praesentium optio, sapiente distinctio illo?',
    likes: 12,
    replies: 3,
  };

  chartOptions: AgChartOptions = {
    // Data: Data to be displayed in the chart
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
    // Series: Defines which chart type and data to use
    series: [
      {
        type: 'line',
        xKey: 'month',
        yKey: 'userRegistrations',
        stroke: '#1f77b4', // Line color (for line chart)
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
    // Data: Data to be displayed in the chart
    data: [
      { type: 'Publications', count: 120 },
      { type: 'Projects', count: 80 },
      { type: 'Patents', count: 50 },
    ],
    // Series: Defines which chart type and data to use
    series: [
      {
        type: 'pie',
        angleKey: 'count',
        fills: ['#1f77b4', '#ff7f0e', '#2ca02c'], // Colors for each slice
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

  // addNewUser(): void {
  //   this.router.navigate(['/admin/users/create']);
  // }

  addNewProject(): void {
    this.router.navigate(['/admin/projects/create']);
  }

  reviewFlaggedContent(): void {
    this.router.navigate(['/admin/content/flagged']);
  }

  reviewPendingApprovals(): void {
    this.router.navigate(['/admin/approvals/pending']);
  }

  generateReports(): void {
    this.router.navigate(['/admin/reports']);
  }

  userForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    role: new FormControl(''),
  });

  contentForm = new FormGroup({
    type: new FormControl(''),
    status: new FormControl(''),
    date: new FormControl(''),
  });
}
