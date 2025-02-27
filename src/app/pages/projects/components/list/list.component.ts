import { Component, inject, OnInit } from '@angular/core';
import { PaginationService } from '@core/services/pagination.service';
import { FilterPanelComponent } from '../../../../shared/components/filter-panel/filter-panel.component';
import { ProjectCardComponent } from '../../../../shared/components/project-card/project-card.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ActivatedRoute } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ProjectService } from '@core/services/project.service';
import { DashboardRecentProjectItem } from '@shared/types/dashboard.types';
import { Project } from '@shared/types/project.types';

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
  projects: Project[] = [];

  ngOnInit(): void {
    this.paginationUsage();

    this.projectService.getAllProjects().subscribe((projects) => {
      this.projects = projects;
      console.log('projects', projects);
      this.paginationUsage();
    });

    // this.route.queryParams.subscribe((params) => {
    //   console.log('params', params);
    //   if (params['mode'] === 'mine') {
    //     console.log('mine');
    //     const newProjects = this.projects.filter((project) => project.id < 6);
    //     this.projects = newProjects;
    //     this.paginationUsage();
    //   }
    // });
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
}
