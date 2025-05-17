import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FilterPanelComponent } from '../../../../shared/components/filter-panel/filter-panel.component';
import { ProjectCardComponent } from '../../../../shared/components/project-card/project-card.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ProjectService } from '@core/services/project.service';
import { ProjectDTO } from '@models/project.model';
import { ProjectSearchFilters } from '@shared/types/search.types';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'projects-list',
  imports: [
    FilterPanelComponent,
    ProjectCardComponent,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class ListProjectsComponent implements OnInit {
  private readonly projectService = inject(ProjectService);

  projects = signal<ProjectDTO[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  filters = signal<ProjectSearchFilters>({});

  showPagination = computed(
    () => this.projects().length > 0 && this.totalElements() > this.pageSize()
  );

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.isLoading.set(true);
    this.projectService
      .searchProjects(this.filters(), this.currentPage(), this.pageSize())
      .subscribe({
        next: (projects) => {
          this.projects.set(projects.data.content);
          this.totalElements.set(projects.data.totalElements);
          this.pageSize.set(projects.data.size);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading projects:', err);
          this.isLoading.set(false);
        },
      });
  }

  onFiltering(filters: ProjectSearchFilters): void {
    this.isLoading.set(true);
    this.currentPage.set(0);
    this.filters.set(filters);
    this.loadProjects();
  }

  onFiltersReset(): void {
    this.currentPage.set(0);
    this.filters.set({});
    this.loadProjects();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadProjects();
  }
}
