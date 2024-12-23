import {
  Component,
  ElementRef,
  inject,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CustomButtonComponent } from '../../../../shared/components/custom-button/custom-button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verification-code',
  imports: [CustomButtonComponent],
  templateUrl: './verification-code.component.html',
  styleUrl: './verification-code.component.scss',
})
export class VerificationCodeComponent {
  // VERIFICATION CODE INPUT FUNCTIONALITY
  private router = inject(Router);

  // Property to hold the input values
  inputValues: string[] = [];

  // Handle keyup to move to the next input
  goToNextInput(event: KeyboardEvent, index: number): void {
    const key = event.key;
    const target = event.target as HTMLInputElement;
    const parent = target.parentElement;

    if (!parent) return;

    // Prevent default for non-numeric keys except Tab and Backspace
    if (key !== 'Tab' && key !== 'Backspace' && (key < '0' || key > '9')) {
      event.preventDefault();
      return;
    }

    if (key === 'Tab') return;

    // Update the inputValues array
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

  // Handle keydown to allow only numeric input, Tab, and Backspace
  onKeyDown(event: KeyboardEvent): void {
    const key = event.key;

    if (key === 'Tab' || key === 'Backspace' || (key >= '0' && key <= '9'))
      return;

    event.preventDefault();
  }

  // Select the input text when focused
  onFocus(event: FocusEvent): void {
    const target = event.target as HTMLInputElement;
    target.select();
  }

  // Find the next input element within the same parent
  private findNextInput(
    currentInput: HTMLInputElement,
    parent: HTMLElement
  ): HTMLInputElement | null {
    const inputs = Array.from(parent.querySelectorAll('input'));
    const currentIndex = inputs.indexOf(currentInput);

    if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
      return inputs[currentIndex + 1] as HTMLInputElement;
    }

    return null; // Do not go back to the first input
  }

  // Find the previous input element within the same parent
  private findPrevInput(
    currentInput: HTMLInputElement,
    parent: HTMLElement
  ): HTMLInputElement | null {
    const inputs = Array.from(parent.querySelectorAll('input'));
    const currentIndex = inputs.indexOf(currentInput);

    if (currentIndex > 0) {
      return inputs[currentIndex - 1] as HTMLInputElement;
    }

    return null; // Do not go back to the last input
  }

  // VERIFICATION CODE INPUT FUNCTIONALITY

  public onSubmit() {
    console.log('Verification code submitted');
    this.router.navigate(['/dashboard']);
  }
}
