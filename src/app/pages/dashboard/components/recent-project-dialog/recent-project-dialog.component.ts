import { CommonModule, JsonPipe } from '@angular/common';
import {
  Component,
  inject,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DashboardRecentProjectItemModal } from '../../../../shared/types/dashboard.types';
import { DashboardMetricsContent } from '../../../../../../content/dashboardMetrics.content';
import { recentProjectModalContent } from '../../../../../../content/recentProjects.content';

@Component({
  selector: 'app-recent-project-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    JsonPipe,
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
