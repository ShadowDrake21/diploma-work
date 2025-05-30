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
import { AuthService } from '@core/authentication/auth.service';
import { Subject, Subscription, take, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'app-session-warning',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <ng-template #sessionWarning>
      <h2 mat-dialog-title>Session Expiration Warning</h2>
      <mat-dialog-content>
        <p>Your session will expire soon. Would you like to stay logged in?</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close (click)="close()">
          No, log me out
        </button>
        <button mat-raised-button color="primary" (click)="extendSession()">
          Yes, keep me logged in
        </button>
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
  private readonly warningThreshold = 5 * 60 * 1000;
  private destroy$ = new Subject<void>();

  showCountdown = false;
  countdownMinutes = 0;
  countdownSeconds = 0;
  private countdownSub?: Subscription;

  ngOnInit() {
    this.checkSession();
    this.setupSessionWarningListener();
  }

  private checkSession() {
    const token = this.authService.getToken();
    if (!token) return;
    const decoded = this.authService.decodeToken(token);
    if (!decoded) return;

    const timeLeft = decoded.exp * 1000 - Date.now();

    if (timeLeft < this.warningThreshold) {
      this.showWarningWithTimeout(timeLeft);
    } else {
      timer(timeLeft - this.warningThreshold)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.showWarningWithTimeout(this.warningThreshold);
        });
    }
  }

  private setupSessionWarningListener() {
    this.authService.sessionWarning$
      .pipe(takeUntil(this.destroy$))
      .subscribe((timeLeft) => {
        this.showWarningWithTimeout(timeLeft);
      });
  }

  private showWarningWithTimeout(timeLeft: number) {
    const dialogRef = this.openWarningDialog();
    this.startCountdown(timeLeft, dialogRef);
  }

  private startCountdown(timeLeft: number, dialogRef: any) {
    this.showCountdown = true;

    const endTime = Date.now() + timeLeft;

    this.countdownSub = timer(0, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const remaining = Math.max(0, endTime - Date.now());
        this.countdownMinutes = Math.floor(remaining / 60000);
        this.countdownSeconds = Math.floor((remaining % 60000) / 1000);
        if (remaining <= 0) {
          this.stopCountdown();
          dialogRef.close();
          this.authService.logout();
        }
      });
  }

  private stopCountdown() {
    if (this.countdownSub) {
      this.countdownSub.unsubscribe();
      this.countdownSub = undefined;
    }
    this.showCountdown = false;
  }

  private openWarningDialog() {
    const template = this.sessionWarningTemplate();
    if (!template) return;

    const dialogRef = this.dialog.open(template, {
      disableClose: true,
      width: '400px',
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result !== 'extended') {
          // User didn't extend session, you might want to log them out
        }
      });
    return dialogRef;
  }

  extendSession() {
    this.stopCountdown();
    this.authService.setRememberSession(true);
    this.authService.refreshToken().subscribe({
      next: () => {
        this.dialog.closeAll();
      },
      error: (error) => {
        console.error('Error extending session:', error);
        this.dialog.closeAll();
      },
    });
  }

  close() {
    this.dialog.closeAll();
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopCountdown();
  }
}
