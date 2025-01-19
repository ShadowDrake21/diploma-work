import { Component, inject, input } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ProfileProjectsComponent } from '../../../../shared/components/profile-projects/profile-projects.component';
import { PaginationService } from '@core/services/pagination.service';
import { recentProjectContent } from '@content/recentProjects.content';
import { usersContent } from '@content/users.content';
import { UsersListComponent } from '../../../../shared/components/users-list/users-list.component';
import { IUser } from '@shared/types/users.types';

@Component({
  selector: 'user-tabs',
  imports: [MatTabGroup, MatTab, ProfileProjectsComponent, UsersListComponent],
  templateUrl: './user-tabs.component.html',
  styleUrl: './user-tabs.component.scss',
  providers: [PaginationService],
})
export class TabsComponent {
  paginationService = inject(PaginationService);
  userSig = input.required<IUser | undefined>({ alias: 'user' });

  userProjects = recentProjectContent;
  users = usersContent;
  pages: number[] = [];

  tabChanged(index: number) {
    switch (index) {
      case 0:
        this.paginationUsage('projects');
        break;
      case 1:
        this.paginationUsage('projects');
        break;
      case 2:
        this.paginationUsage('projects');
        break;
      case 3:
        this.paginationUsage('users');
        break;
      case 4:
        console.log('Contact information tab selected');
        break;
      default:
        console.log('Invalid tab index');
        break;
    }
  }

  paginationUsage(type: 'users' | 'projects' = 'projects') {
    this.paginationService.currentPage = 1;
    this.paginationService.elements =
      type === 'users' ? this.users : this.userProjects;
    this.paginationService.updateVisibleElements();
    this.pages = Array.from(
      { length: this.paginationService.numPages() },
      (_, i) => i + 1
    );
  }
}
