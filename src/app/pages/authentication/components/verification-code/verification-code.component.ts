import { Component, inject } from '@angular/core';
import { CustomButtonComponent } from '@shared/components/custom-button/custom-button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verification-code',
  imports: [CustomButtonComponent],
  templateUrl: './verification-code.component.html',
  styleUrl: './verification-code.component.scss',
})
export class VerificationCodeComponent {
  private router = inject(Router);

  inputValues: string[] = [];

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

  public onSubmit() {
    console.log('Verification code submitted');
    this.router.navigate(['/dashboard']);
  }
}
