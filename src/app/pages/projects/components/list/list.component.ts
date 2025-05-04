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

@Component({
  selector: 'projects-list',
  imports: [FilterPanelComponent, ProjectCardComponent, PaginationComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  providers: [PaginationService, provideNativeDateAdapter()],
})
export class ListProjectsComponent implements OnInit {
  private route = inject(ActivatedRoute);

  paginationService = inject(PaginationService);
  projectService = inject(ProjectService);

  pages: number[] = [];
  projects: ProjectDTO[] = [];

  searchResults: any[] = [];
  isLoading = false;
  totalElements = 0;
  currentPage = 0;
  pageSize = 10;

  ngOnInit(): void {
    this.paginationUsage();

    this.projectService.getAllProjects().subscribe((projects) => {
      this.searchResults = projects.data;
      console.log('projects', projects);
      this.paginationUsage();
    });
  }

  onFiltering(filters: any): void {
    console.log('filters', filters);
    this.projectService.searchProjects(filters).subscribe({
      next: (projects) => {
        this.searchResults = projects.data.content;
        this.totalElements = projects.data.totalElements;
        this.pageSize = projects.data.size;
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

    this.pages = Array.from(
      { length: this.paginationService.numPages() },
      (_, i) => i + 1
    );
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}
