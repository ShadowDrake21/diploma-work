import { Component, inject, input, OnInit } from '@angular/core';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { FilterPanelComponent } from '../filter-panel/filter-panel.component';
import { ProjectCardComponent } from '@shared/components/project-card/project-card.component';
import { PaginationService } from '@core/services/pagination.service';
import { recentProjectContent } from '@content/recentProjects.content';
import { DashboardRecentProjectItem } from '@shared/types/dashboard.types';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/authentication/auth.service';
import { Observable } from 'rxjs';
import { Project } from '@shared/types/project.types';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'shared-profile-projects',
  imports: [
    PaginationComponent,
    FilterPanelComponent,
    ProjectCardComponent,
    AsyncPipe,
  ],
  templateUrl: './profile-projects.component.html',
  styleUrl: './profile-projects.component.scss',
})
export class ProfileProjectsComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  projectsSig = input.required<DashboardRecentProjectItem[]>({
    alias: 'projects',
  });
  paginationServiceSig = input.required<PaginationService>({
    alias: 'paginationService',
  });

  pages: number[] = [];
  userProjects$!: Observable<Project[]>;

  ngOnInit(): void {
    this.paginationUsage();
    this.userProjects$ = this.userService.getUserProjects(
      this.authService.getCurrentUserId() || 0
    );
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
