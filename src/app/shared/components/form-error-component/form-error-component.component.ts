import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatError } from '@angular/material/form-field';

@Component({
  selector: 'shared-form-error',
  imports: [MatError],
  template: ` @if (control?.invalid && control?.touched) { @for (error of
    errors; track error.key) { @if (control?.hasError(error.key)) {
    <mat-error>{{ error.message }}</mat-error>
    } } }`,
})
export class FormErrorComponentComponent {
  @Input() control?: AbstractControl;
  @Input() errors: { key: string; message: string }[] = [];
}
