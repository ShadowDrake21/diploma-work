import { Component, input, OnInit } from '@angular/core';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { FilterPanelComponent } from '../filter-panel/filter-panel.component';
import { ProjectCardComponent } from '@shared/components/project-card/project-card.component';
import { PaginationService } from '@core/services/pagination.service';
import { recentProjectContent } from '@content/recentProjects.content';
import { DashboardRecentProjectItem } from '@shared/types/dashboard.types';

@Component({
  selector: 'shared-profile-projects',
  imports: [PaginationComponent, FilterPanelComponent, ProjectCardComponent],
  templateUrl: './profile-projects.component.html',
  styleUrl: './profile-projects.component.scss',
})
export class ProfileProjectsComponent implements OnInit {
  projectsSig = input.required<DashboardRecentProjectItem[]>({
    alias: 'projects',
  });
  paginationServiceSig = input.required<PaginationService>({
    alias: 'paginationService',
  });

  pages: number[] = [];

  ngOnInit(): void {
    this.paginationUsage();
  }

  paginationUsage() {
    this.paginationServiceSig().currentPage = 1;
    this.paginationServiceSig().elements = recentProjectContent;
    // this.paginationService.itemsPerPage = 8;
    this.paginationServiceSig().updateVisibleElements();

    this.pages = Array.from(
      { length: this.paginationServiceSig().numPages() },
      (_, i) => i + 1
    );
  }
}
