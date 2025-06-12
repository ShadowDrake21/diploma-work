import { Component, computed, input, OnDestroy, output } from '@angular/core';
import { FilterPanelComponent } from '../filter-panel/filter-panel.component';
import { ProjectCardComponent } from '@shared/components/project-card/project-card.component';
import { ProjectDTO } from '@models/project.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ProjectSearchFilters } from '@shared/types/search.types';
import { MatButton } from '@angular/material/button';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'shared-profile-projects',
  imports: [
    MatPaginatorModule,
    FilterPanelComponent,
    ProjectCardComponent,
    MatButton,
    TitleCasePipe,
  ],
  templateUrl: './profile-projects.component.html',
})
export class ProfileProjectsComponent {
  projects = input.required<ProjectDTO[]>();
  pageSize = input(5);
  currentPage = input(0);
  totalItems = input(0);
  isFiltered = input(true);
  type = input<string>('projects');
  viewText = input<string>('проекти');

  filters = output<ProjectSearchFilters>();
  pageChange = output<PageEvent>();

  onPageChange(event: PageEvent) {
    console.log('Page changed ProfileProjectsComponent:', event);
    this.pageChange.emit(event);
  }

  onFiltersApplied(filters: ProjectSearchFilters) {
    console.log('Filters applied:', filters);
    this.filters.emit(filters);
  }

  onFiltersReset() {
    this.filters.emit({});
  }
}
