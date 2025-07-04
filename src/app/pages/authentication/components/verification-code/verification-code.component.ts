import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CustomButtonComponent } from '@shared/components/custom-button/custom-button.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

const CODE_LENGTH = 6;

@Component({
  selector: 'app-verification-code',
  imports: [CustomButtonComponent],
  templateUrl: './verification-code.component.html',
})
export class VerificationCodeComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  readonly inputValues = signal<string[]>(Array(CODE_LENGTH).fill(''));
  readonly verificationMessage = signal<string>('');
  readonly email = signal<string>('');
  readonly isLoading = signal<boolean>(false);

  private subscription!: Subscription;

  ngOnInit(): void {
    this.route.queryParams.subscribe({
      next: (params) => {
        this.email.set(params['email'] || '');
      },
      error: (error) => {
        console.error('Error reading query params:', error);
        this.notificationService.showError(
          'Не вдалося завантажити параметр електронної пошти'
        );
      },
    });
  }

  handleKeyUp(event: KeyboardEvent, index: number): void {
    const target = event.target as HTMLInputElement;
    const key = event.key;
    const parent = target.parentElement;

    if (!parent) return;

    if (!this.isValidKey(key)) {
      event.preventDefault();
      return;
    }

    this.inputValues.update((values) => {
      const newValues = [...values];
      newValues[index] = target.value;
      return newValues;
    });

    if (key === 'Backspace' && target.value === '') {
      this.focusPreviousInput(target, parent);
    } else if (key !== 'Backspace') {
      this.focusNextInput(target, parent);
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isValidKey(event.key)) {
      event.preventDefault();
    }
  }

  handleFocus(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }

  getVerificationCode(): string {
    return this.inputValues().join('');
  }

  focusNextInput(currentInput: HTMLInputElement, parent: HTMLElement): void {
    const inputs = this.getInputElements(parent);
    const currentIndex = inputs.indexOf(currentInput);

    if (currentIndex < inputs.length - 1) {
      inputs[currentIndex + 1].focus();
      inputs[currentIndex + 1].select();
    }
  }

  focusPreviousInput(
    currentInput: HTMLInputElement,
    parent: HTMLElement
  ): void {
    const inputs = this.getInputElements(parent);
    const currentIndex = inputs.indexOf(currentInput);

    if (currentIndex > 0) {
      inputs[currentIndex - 1].focus();
      inputs[currentIndex - 1].select();
    }
  }

  public onSubmit() {
    const code = this.getVerificationCode();

    if (code.length !== CODE_LENGTH) {
      this.notificationService.showError(
        'Будь ласка, введіть дійсний 6-значний код'
      );
      return;
    }

    this.isLoading.set(true);
    this.verificationMessage.set('');

    this.subscription = this.authService
      .verifyUser({ email: this.email(), code })
      .subscribe({
        next: (response) => {
          this.notificationService.showSuccess('Перевірка успішна');

          this.router.navigate(['/']);
        },
        error: (error) => {
          this.handleVerificationError(error);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
  }

  private handleVerificationError(error: HttpErrorResponse): void {
    console.error('Verification failed:', error);
    this.isLoading.set(false);

    if (error.status === 400) {
      this.verificationMessage.set(
        'Недійсний код підтвердження. Спробуйте ще раз.'
      );
    } else if (error.status === 404) {
      this.notificationService.showError(
        'Електронну адресу не знайдено. Будь ласка, запитайте новий код підтвердження.'
      );
      this.router.navigate(['/authentication/sign-up']);
    } else if (error.status === 410) {
      this.notificationService.showError(
        'Термін дії коду підтвердження закінчився. Будь ласка, запитайте новий.'
      );
      this.router.navigate(['/authentication/request-verification']);
    } else if (error.status === 429) {
      this.notificationService.showError(
        'Забагато спроб. Будь ласка, спробуйте пізніше.'
      );
    } else {
      this.notificationService.showError(
        'Не вдалося перевірити. Спробуйте ще раз.'
      );
    }
  }

  private isValidKey(key: string): boolean {
    return key === 'Tab' || key === 'Backspace' || (key >= '0' && key <= '9');
  }

  private getInputElements(parent: HTMLElement): HTMLInputElement[] {
    return Array.from(parent.querySelectorAll('input'));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
