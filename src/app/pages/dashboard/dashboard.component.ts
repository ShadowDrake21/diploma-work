import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { OnlineUsersComponent } from './components/online-users/online-users.component';
import { ProjectsQuickLinksComponent } from '../../shared/components/projects-quick-links/projects-quick-links.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecentProjectsComponent } from './components/recent-projects/recent-projects.component';
import { BasicStatsComponent } from './components/basic-stats/basic-stats.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatSidenavModule,
    MatListModule,
    CommonModule,
    MatIconModule,
    OnlineUsersComponent,
    ProjectsQuickLinksComponent,
    MatProgressSpinnerModule,
    RecentProjectsComponent,
    BasicStatsComponent,
  ],
  templateUrl: './dashboard.component.html',
  host: {
    class: 'flex flex-col min-h-[100vh] h-full',
  },
})
export class DashboardComponent {}
