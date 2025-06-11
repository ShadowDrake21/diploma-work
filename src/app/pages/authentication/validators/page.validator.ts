import { AbstractControl, ValidationErrors } from '@angular/forms';

export class PageValidators {
  static validateStartPage(endPageControlName: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control.parent;
      if (!formGroup) return null;

      const endPageControl = formGroup.get(endPageControlName);
      const endPage = endPageControl?.value;

      if (endPage && control.value && control.value >= endPage) {
        return { invalidRange: true };
      }
      return null;
    };
  }

  static validateEndPage(startPageControlName: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control.parent;
      if (!formGroup) return null;

      const startPageControl = formGroup.get(startPageControlName);
      const startPage = startPageControl?.value;

      if (startPage && control.value && control.value <= startPage) {
        return { invalidRange: true };
      }
      return null;
    };
  }
}
