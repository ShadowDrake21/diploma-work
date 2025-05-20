import { Component, inject, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { AdminService } from '@core/services/admin.service';
import { ProjectTableComponent } from './components/project-table/project-table.component';
import { PublicationsTableComponent } from './components/publications-table/publications-table.component';
import { PatentsTableComponent } from './components/patents-table/patents-table.component';
import { ResearchesTableComponent } from './components/researches-table/researches-table.component';
import { CommentsTableComponent } from './components/comments-table/comments-table.component';

@Component({
  selector: 'app-content-management',
  imports: [
    MatTabsModule,
    ProjectTableComponent,
    PublicationsTableComponent,
    PatentsTableComponent,
    ResearchesTableComponent,
    CommentsTableComponent,
  ],
  templateUrl: './content-management.component.html',
  styleUrl: './content-management.component.scss',
})
export class ContentManagementComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  ngOnInit(): void {
    this.adminService.loadAllProjects();
    this.adminService.loadAllPublications();
    this.adminService.loadAllPatents();
    this.adminService.loadAllResearches();
    this.adminService.loadAllComments();
  }
}
