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
import { MatTabsModule } from '@angular/material/tabs';
import { UsersListComponent } from '@shared/components/users-list/users-list.component';
import { TabsComponent } from './components/user-tabs/user-tabs.component';

@Component({
  selector: 'app-user',
  imports: [
    MetricCardItemComponent,
    ProfileProjectsComponent,
    MatTabsModule,
    UsersListComponent,
    TabsComponent,
  ],
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
  users = usersContent;
  pages: number[] = [];

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.userId = params['id'];
    });

    this.getUserById();
    this.paginationUsage();
    this.headerService.setTitle('User: ' + this.user?.fullName);
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

  paginationUsage() {
    this.paginationService.currentPage = 1;
    this.paginationService.elements = this.users;
    this.paginationService.itemsPerPage = 5;
    this.paginationService.updateVisibleElements();

    this.pages = Array.from(
      { length: this.paginationService.numPages() },
      (_, i) => i + 1
    );
  }

  tabChanged(index: number) {
    switch (index) {
      case 0:
        this.paginationService.elements = this.userProjects;
        this.paginationService.updateVisibleElements();
        console.log('Publications tab selected');
        break;
      case 1:
        this.paginationService.elements = this.userProjects;
        this.paginationService.updateVisibleElements();
        console.log('Patents tab selected');
        break;
      case 2:
        this.paginationService.elements = this.userProjects;
        this.paginationService.updateVisibleElements();
        console.log('Research tab selected');
        break;
      case 3:
        this.paginationService.elements = this.users;
        this.paginationService.updateVisibleElements();
        console.log('Collaborators tab selected');
        break;
      case 4:
        console.log('Contact information tab selected');
        break;
      default:
        console.log('Invalid tab index');
        break;
    }
    console.log(index);
  }
}
