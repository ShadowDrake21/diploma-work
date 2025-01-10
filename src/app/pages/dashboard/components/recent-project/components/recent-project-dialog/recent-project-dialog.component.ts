import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { recentProjectModalContent } from '@content/recentProjects.content';
import { DashboardRecentProjectItemModal } from '@shared/types/dashboard.types';

@Component({
  selector: 'app-recent-project-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './recent-project-dialog.component.html',
  styleUrl: './recent-project-dialog.component.scss',
})
export class RecentProjectDialogComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  extendedData: DashboardRecentProjectItemModal | undefined = undefined;

  ngOnInit(): void {
    this.extendedData = recentProjectModalContent.find(
      (item) => item.id === this.data.id
    );
  }
}
