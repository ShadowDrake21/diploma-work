import { Component, inject, input, OnInit } from '@angular/core';
import { FilterPanelComponent } from '@shared/components/filter-panel/filter-panel.component';
import { ProjectCardComponent } from '@shared/components/project-card/project-card.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { PaginationService } from '@core/services/pagination.service';
import { recentProjectContent } from '@content/recentProjects.content';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ProjectsComponent } from './components/projects/projects.component';
import { CommentsComponent } from './components/comments/comments.component';

@Component({
  selector: 'app-content-management',
  imports: [MatButtonModule, ProjectsComponent, CommentsComponent],
  templateUrl: './content-management.component.html',
  styleUrl: './content-management.component.scss',
  providers: [PaginationService, provideNativeDateAdapter()],
})
export class ContentManagementComponent {}
