import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RecentProjectDialogComponent } from './components/recent-project-dialog/recent-project-dialog.component';
import { ProjectItem } from '@shared/types/project.types';
import { NotificationService } from '@core/services/notification.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'dashboard-recent-project',
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './recent-project.component.html',
  styleUrl: './recent-project.component.scss',
})
export class RecentProjectComponent {
  readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);

  project = input.required<ProjectItem>();
  isOpening = false;

  openDialog() {
    this.isOpening = true;

    const dialogRef = this.dialog.open(RecentProjectDialogComponent, {
      data: this.project(),
    });

    dialogRef.afterClosed().subscribe({
      next: (result) => {
        this.isOpening = false;
        if (result) {
          this.notificationService.showSuccess('Action completed successfully');
        }
      },
      error: (err) => {
        this.isOpening = false;
        this.notificationService.showError('Failed to open project details');
        console.error('Dialog error:', err);
      },
    });
  }
}
