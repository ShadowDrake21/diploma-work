import { Component, inject, OnInit } from '@angular/core';
import { CustomButtonComponent } from '@shared/components/custom-button/custom-button.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';

@Component({
  selector: 'app-verification-code',
  imports: [CustomButtonComponent],
  templateUrl: './verification-code.component.html',
  styleUrl: './verification-code.component.scss',
})
export class VerificationCodeComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  inputValues: string[] = [];
  verificationMessage: string = '';
  email: string = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] || '';
    });
  }

  goToNextInput(event: KeyboardEvent, index: number): void {
    const key = event.key;
    const target = event.target as HTMLInputElement;
    const parent = target.parentElement;

    if (!parent) return;

    if (key !== 'Tab' && key !== 'Backspace' && (key < '0' || key > '9')) {
      event.preventDefault();
      return;
    }

    if (key === 'Tab') return;

    this.inputValues[index] = target.value;

    if (key === 'Backspace' && target.value === '') {
      const prevInput = this.findPrevInput(target, parent);
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    } else {
      const nextInput = this.findNextInput(target, parent);
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    const key = event.key;

    if (key === 'Tab' || key === 'Backspace' || (key >= '0' && key <= '9'))
      return;

    event.preventDefault();
  }

  onFocus(event: FocusEvent): void {
    const target = event.target as HTMLInputElement;
    target.select();
  }

  private findNextInput(
    currentInput: HTMLInputElement,
    parent: HTMLElement
  ): HTMLInputElement | null {
    const inputs = Array.from(parent.querySelectorAll('input'));
    const currentIndex = inputs.indexOf(currentInput);

    if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
      return inputs[currentIndex + 1] as HTMLInputElement;
    }

    return null;
  }

  private findPrevInput(
    currentInput: HTMLInputElement,
    parent: HTMLElement
  ): HTMLInputElement | null {
    const inputs = Array.from(parent.querySelectorAll('input'));
    const currentIndex = inputs.indexOf(currentInput);

    if (currentIndex > 0) {
      return inputs[currentIndex - 1] as HTMLInputElement;
    }

    return null;
  }

  private getVerificationCode(): string {
    return this.inputValues.join('');
  }

  public onSubmit() {
    const code = this.getVerificationCode();

    if (code.length !== 6) {
      this.verificationMessage = 'Please enter a valid 6-digit code';
      return;
    }

    this.authService.verifyUser(this.email, code).subscribe({
      next: (response) => {
        this.verificationMessage = 'Verification successful';
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.verificationMessage =
          'Invalid verification code. Please try again';
      },
    });
  }
}
