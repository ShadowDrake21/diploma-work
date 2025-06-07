import { AbstractControl, ValidationErrors } from '@angular/forms';

export class DateValidators {
  static validateStartDate(endDateControlName: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control.parent;
      if (!formGroup) return null;

      const endDateControl = formGroup.get(endDateControlName);
      const endDate = endDateControl?.value;

      if (
        endDate &&
        control.value &&
        new Date(control.value) > new Date(endDate)
      ) {
        return { beforeEnd: true };
      }
      return null;
    };
  }

  static validateEndDate(startDateControlName: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control.parent;
      if (!formGroup) return null;

      const startDateControl = formGroup.get(startDateControlName);
      const startDate = startDateControl?.value;

      if (
        startDate &&
        control.value &&
        new Date(control.value) < new Date(startDate)
      ) {
        return { beforeStart: true };
      }
      return null;
    };
  }

  static validatePublicationDate(
    control: AbstractControl
  ): ValidationErrors | null {
    if (control.value && new Date(control.value) > new Date()) {
      return { futureDate: true };
    }
    return null;
  }
}
