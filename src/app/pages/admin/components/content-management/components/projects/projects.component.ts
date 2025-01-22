import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { recentProjectContent } from '@content/recentProjects.content';
import { PaginationService } from '@core/services/pagination.service';
import { FilterPanelComponent } from '@shared/components/filter-panel/filter-panel.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { ProjectCardComponent } from '@shared/components/project-card/project-card.component';

@Component({
  selector: 'admin-projects',
  imports: [
    FilterPanelComponent,
    ProjectCardComponent,
    PaginationComponent,
    MatButtonModule,
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  providers: [PaginationService, provideNativeDateAdapter()],
})
export class ProjectsComponent implements OnInit {
  paginationService = inject(PaginationService);

  pages: number[] = [];
  projects = [...recentProjectContent, ...recentProjectContent];

  ngOnInit(): void {
    this.paginationUsage();
  }

  addPublication() {}

  approve(id: any) {}

  editUser(id: any) {}

  deleteUser(id: any) {}

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
