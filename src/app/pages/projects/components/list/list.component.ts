import { Component, inject, Input, OnInit } from '@angular/core';
import { PaginationService } from '@core/services/pagination.service';
import { FilterPanelComponent } from '../../../../shared/components/filter-panel/filter-panel.component';
import { ProjectCardComponent } from '../../../../shared/components/project-card/project-card.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ActivatedRoute } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ProjectService } from '@core/services/project.service';
import { DashboardRecentProjectItem } from '@shared/types/dashboard.types';
import { ProjectDTO } from '@models/project.model';
import { ProjectSearchFilters } from '@shared/types/search.types';

@Component({
  selector: 'projects-list',
  imports: [FilterPanelComponent, ProjectCardComponent, PaginationComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  providers: [PaginationService, provideNativeDateAdapter()],
})
export class ListProjectsComponent implements OnInit {
  private paginationService = inject(PaginationService);
  private projectService = inject(ProjectService);

  projects: ProjectDTO[] = [];
  isLoading = false;
  totalElements = 0;
  currentPage = 0;
  pageSize = 10;

  ngOnInit(): void {
    this.loadProjects();
  }

  onFiltering(filters: ProjectSearchFilters): void {
    this.isLoading = true;
    this.currentPage = 0;

    this.projectService
      .searchProjects(filters, this.currentPage, this.pageSize)
      .subscribe({
        next: (projects) => {
          this.projects = projects.data.content;
          this.totalElements = projects.data.totalElements;
          this.pageSize = projects.data.size;
          this.isLoading = false;
          this.updatePagination();
        },
        error: (err) => {
          console.error('Error searching projects:', err);
          this.isLoading = false;
        },
      });
  }

  paginationUsage() {
    this.paginationService.currentPage = 1;
    this.paginationService.elements = this.projects;
    this.paginationService.itemsPerPage = 10;
    this.paginationService.updateVisibleElements();
  }

  get pages(): number[] {
    return Array.from(
      {
        length: this.paginationService.numPages(),
      },
      (_, i) => i + 1
    );
  }

  get currentPaginationPage(): number {
    return this.paginationService.currentPage;
  }

  prevPage(): void {
    this.paginationService.prevPage();
  }

  nextPage(): void {
    this.paginationService.nextPage();
  }

  goToPage(page: number): void {
    this.paginationService.goToPage(page);
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProjects();
  }

  private loadProjects(): void {
    this.isLoading = true;
    this.projectService
      .searchProjects({}, this.currentPage, this.pageSize)
      .subscribe({
        next: (projects) => {
          this.projects = projects.data.content;
          this.totalElements = projects.data.totalElements;
          this.pageSize = projects.data.size;
          this.isLoading = false;
          this.updatePagination();
        },
        error: (err) => {
          console.error('Error loading projects:', err);
          this.isLoading = false;
        },
      });
  }

  private updatePagination(): void {
    this.paginationService.elements = this.projects;
    this.paginationService.currentPage = this.currentPage + 1;
    this.paginationService.itemsPerPage = this.pageSize;
    this.paginationService.updateVisibleElements();
  }
}
