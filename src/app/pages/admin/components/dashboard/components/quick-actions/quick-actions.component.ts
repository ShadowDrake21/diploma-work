import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'admin-dashboard-quick-actions',
  imports: [],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.scss',
})
export class QuickActionsComponent {
  private router = inject(Router);
  addNewProject(): void {
    this.router.navigate(['/admin/projects/create']);
  }

  reviewFlaggedContent(): void {
    this.router.navigate(['/admin/content/flagged']);
  }

  reviewPendingApprovals(): void {
    this.router.navigate(['/admin/approvals/pending']);
  }

  generateReports(): void {
    this.router.navigate(['/admin/reports']);
  }
}
