import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { recentProjectContent } from '@content/recentProjects.content';
import { usersContent } from '@content/users.content';
import { MetricCardItemComponent } from '@shared/components/metric-card-item/metric-card-item.component';
import { DashboardMetricCardItem } from '@shared/types/dashboard.types';
import { IUser } from '@shared/types/users.types';
import { ProfileProjectsComponent } from '../../shared/components/profile-projects/profile-projects.component';
import { HeaderService } from '@core/services/header.service';
import { PaginationService } from '@core/services/pagination.service';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-user',
  imports: [MetricCardItemComponent, ProfileProjectsComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  providers: [provideNativeDateAdapter(), PaginationService],
})
export class UserComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private headerService = inject(HeaderService);
  paginationService = inject(PaginationService);

  userId: string | null = null;
  user: IUser | undefined = undefined;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.userId = params['id'];
    });

    this.getUserById();
  }

  getUserById() {
    if (!this.userId) return;

    this.user = usersContent.find((user) => user.id === this.userId);
  }

  userProjects = [...recentProjectContent, ...recentProjectContent];

  userMetrics() {
    if (!this.user) return [];

    const metrics: DashboardMetricCardItem[] = [
      {
        title: 'Publications',
        value: this.user.publications + '',
        link: '',
        icon: 'description',
      },
      {
        title: 'Patents',
        value: this.user?.patents + '',
        link: '',
        icon: 'gavel',
      },
      {
        title: 'Research Projects',
        value: this.user?.ongoingProjects + '',
        link: '',
        icon: 'science',
      },
    ];
    return metrics;
  }
}
