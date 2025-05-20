import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService } from '@core/services/admin.service';
import { ProjectType } from '@shared/enums/categories.enum';

@Component({
  selector: 'app-project-table',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressBarModule,
    DatePipe,
  ],
  templateUrl: './project-table.component.html',
  styleUrl: './project-table.component.scss',
})
export class ProjectTableComponent {
  private adminService = inject(AdminService);

  displayedColumns: string[] = [
    'title',
    'type',
    'creator',
    'progress',
    'createdAt',
    'actions',
  ];

  projects = this.adminService.projects;
  pagination = this.adminService.projectsPagination;

  getProjectTypeName(type: ProjectType): string {
    return ProjectType[type];
  }

  onPageChange(event: PageEvent) {
    this.adminService.loadAllProjects(event.pageIndex, event.pageSize);
  }
}
