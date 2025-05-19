import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '@core/services/admin.service';

@Component({
  selector: 'app-admin-invite-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './admin-invite-dialog.component.html',
  styleUrl: './admin-invite-dialog.component.scss',
})
export class AdminInviteDialogComponent {
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<AdminInviteDialogComponent>);

  inviteForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  isLoading = signal(false);

  onSubmit() {
    if (this.inviteForm.invalid) return;

    this.isLoading.set(true);
    const email = this.inviteForm.value.email!;

    this.adminService.inviteAdmin({ email }).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(`Invitation sent to ${email}`, 'Close', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        } else {
          this.snackBar.open(
            response.message || 'Failed to send invitation',
            'Close',
            { duration: 5000 }
          );
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.snackBar.open(
          error.message || 'Failed to send invitation',
          'Close',
          { duration: 5000 }
        );
        this.isLoading.set(false);
      },
    });
  }
}
