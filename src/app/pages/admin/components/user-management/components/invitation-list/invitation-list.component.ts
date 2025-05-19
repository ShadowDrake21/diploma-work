import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { AdminService } from '@core/services/admin.service';
import { AdminInvitation } from '../types/invitation-list.types';
import { AdminInviteDialogComponent } from '../dialogs/admin-invite-dialog/admin-invite-dialog.component';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { MatChipsModule } from '@angular/material/chips';

//TODO: BACKEND!

@Component({
  selector: 'app-invitation-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './invitation-list.component.html',
  styleUrl: './invitation-list.component.scss',
})
export class InvitationListComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  invitations = signal<AdminInvitation[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  totalItems = signal<number>(0);

  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  displayedColumns = ['email', 'invitedAt', 'expiresAt', 'status', 'actions'];

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  loadInvitations(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.adminService
      .getAdminInvitations(this.currentPage(), this.pageSize())
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.invitations.set(response.data);
            this.totalItems.set(response.totalItems);
          } else {
            this.error.set(response.message || 'Failed to load invitations');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load invitations');
          this.isLoading.set(false);
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadInvitations();
  }

  openInviteDialog(): void {
    const dialogRef = this.dialog.open(AdminInviteDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadInvitations();
      }
    });
  }

  resendInvitation(invitation: AdminInvitation): void {
    this.adminService.resendInvitation(invitation.id).subscribe({
      next: () => {
        this.snackBar.open('Invitation resent successfully', 'Close', {
          duration: 3000,
        });
        this.loadInvitations();
      },
      error: (err) => {
        this.snackBar.open(
          err.message || 'Failed to resend invitation',
          'Close',
          {
            duration: 3000,
          }
        );
      },
    });
  }

  revokeInvitation(invitation: AdminInvitation): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Revoke Invitation',
        message: `Are you sure you want to revoke the invitation to ${invitation.email}?`,
        confirmText: 'Revoke',
        warn: true,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.revokeInvitation(invitation.id).subscribe({
          next: () => {
            this.snackBar.open('Invitation revoked successfully', 'Close', {
              duration: 3000,
            });
            this.loadInvitations();
          },
          error: (err) => {
            this.snackBar.open(
              err.message || 'Failed to revoke invitation',
              'Close',
              {
                duration: 3000,
              }
            );
          },
        });
      }
    });
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'primary';
      case 'accepted':
        return 'accept';
      case 'expired':
        return 'warn';
      default:
        return '';
    }
  }
}
