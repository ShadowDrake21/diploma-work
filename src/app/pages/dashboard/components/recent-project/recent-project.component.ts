import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RecentProjectDialogComponent } from '../recent-project-dialog/recent-project-dialog.component';
import { DashboardRecentProjectItem } from '../../../../shared/types/dashboard.types';
import { ProjectItem } from '../../../../shared/types/project.types';

@Component({
  selector: 'dashboard-recent-project',
  imports: [CommonModule],
  templateUrl: './recent-project.component.html',
  styleUrl: './recent-project.component.scss',
})
export class RecentProjectComponent {
  readonly dialog = inject(MatDialog);
  project = input.required<ProjectItem>();

  openDialog() {
    const dialogRef = this.dialog.open(RecentProjectDialogComponent, {
      data: this.project(),
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
