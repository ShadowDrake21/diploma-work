import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ProjectTableComponent } from './components/project-table/project-table.component';
import { CommentsTableComponent } from './components/comments-table/comments-table.component';

@Component({
  selector: 'app-content-management',
  imports: [MatTabsModule, ProjectTableComponent, CommentsTableComponent],
  templateUrl: './content-management.component.html',
  styleUrl: './content-management.component.scss',
})
export class ContentManagementComponent {}
