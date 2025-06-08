import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { Subject, Subscription, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'app-session-warning',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <ng-template #sessionWarning>
      <h2 mat-dialog-title>Session Expiration Warning</h2>
      <mat-dialog-content>
        <p>
          Your session will expire in {{ countdownMinutes }} minutes and
          {{ countdownSeconds }} seconds.
        </p>
        <p>You will be automatically logged out when the session expires.</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button
          mat-raised-button
          color="primary"
          mat-dialog-close
          (click)="continue()"
        >
          Continue Working
        </button>
        <button mat-button (click)="logoutNow()">Logout Now</button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styleUrl: './session-warning.component.scss',
})
export class SessionWarningComponent implements OnInit, OnDestroy {
  sessionWarningTemplate =
    viewChild.required<TemplateRef<any>>('sessionWarning');
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private destroy$ = new Subject<void>();

  countdownMinutes = 0;
  countdownSeconds = 0;
  private countdownSub?: Subscription;
  private timeLeft = 0;

  ngOnInit() {
    this.authService.sessionWarning$
      .pipe(takeUntil(this.destroy$))
      .subscribe((timeLeft) => {
        if (timeLeft > 0) {
          this.timeLeft = timeLeft;
          this.showWarningDialog();
        }
      });
  }

  private showWarningDialog() {
    if (this.dialog.openDialogs.length === 0) {
      const dialogRef = this.dialog.open(this.sessionWarningTemplate(), {
        disableClose: true,
        width: '400px',
      });

      this.startCountdown();

      dialogRef
        .afterClosed()
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.stopCountdown();
        });
    }
  }

  private startCountdown() {
    this.stopCountdown();

    const endTime = Date.now() + this.timeLeft;

    this.countdownSub = timer(0, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const remaining = Math.max(0, endTime - Date.now());
        this.countdownMinutes = Math.floor(remaining / 60000);
        this.countdownSeconds = Math.floor((remaining % 60000) / 1000);
        if (remaining <= 0) {
          this.stopCountdown();
          this.dialog.closeAll();
          this.authService.logout();
          this.router.navigate(['/authentication/sign-in']);
        }
      });
  }

  private stopCountdown() {
    if (this.countdownSub) {
      this.countdownSub.unsubscribe();
      this.countdownSub = undefined;
    }
  }

  continue() {
    this.dialog.closeAll();
  }

  logoutNow() {
    this.dialog.closeAll();
    this.authService.logout();
    this.router.navigate(['/authentication/sign-in']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopCountdown();
    this.dialog.closeAll();
  }
}
