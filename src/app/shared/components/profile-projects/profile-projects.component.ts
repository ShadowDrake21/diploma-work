import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { FilterPanelComponent } from '../filter-panel/filter-panel.component';
import { ProjectCardComponent } from '@shared/components/project-card/project-card.component';
import { recentProjectContent } from '@content/recentProjects.content';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/authentication/auth.service';
import { ProjectDTO } from '@models/project.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'shared-profile-projects',
  imports: [
    PaginationComponent,
    FilterPanelComponent,
    ProjectCardComponent,
    MatPaginatorModule,
  ],
  templateUrl: './profile-projects.component.html',
  styleUrl: './profile-projects.component.scss',
})
export class ProfileProjectsComponent {
  projects = input.required<ProjectDTO[]>();
  pageSize = input(8);
  currentPage = input(0);
  isFiltered = input(true);

  filters = output<any>();
  pageChange = output<PageEvent>();

  paginatedProjects = computed(() => {
    const startIndex = this.currentPage() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return this.projects().slice(startIndex, endIndex);
  });

  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }
}
