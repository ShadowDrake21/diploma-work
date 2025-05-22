import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { FilterPanelComponent } from '../filter-panel/filter-panel.component';
import { ProjectCardComponent } from '@shared/components/project-card/project-card.component';
import { ProjectDTO } from '@models/project.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'shared-profile-projects',
  imports: [MatPaginatorModule, FilterPanelComponent, ProjectCardComponent],
  templateUrl: './profile-projects.component.html',
  styleUrl: './profile-projects.component.scss',
})
export class ProfileProjectsComponent {
  projects = input.required<ProjectDTO[]>();
  pageSize = input(8);
  currentPage = input(0);
  isFiltered = input(true);
  type = input<string>('projects');

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
