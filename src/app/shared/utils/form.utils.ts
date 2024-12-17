import { FormControl } from '@angular/forms';

export const getFieldName = (key: string): string => {
  switch (key) {
    case 'name':
      return 'Name';
    case 'email':
      return 'Email';
    case 'password':
      return 'Password';
    case 'confirmPassword':
      return 'Confirm Password';
    default:
      return '';
  }
};

export const getValidationErrorMessage = (
  control: FormControl<string | null>,
  key: string
) => {
  let errorMessage = '';

  if (control.hasError('required')) {
    errorMessage = `${getFieldName(key)} is required.`;
  } else if (control.hasError('minlength')) {
    errorMessage = `${getFieldName(key)} must be at least ${
      control.errors?.['minlength'].requiredLength
    } characters long.`;
  } else if (control.hasError('maxlength')) {
    errorMessage = `${getFieldName(key)} cannot exceed ${
      control.errors?.['maxlength'].requiredLength
    } characters.`;
  } else if (key === 'email' && control.hasError('email')) {
    errorMessage = 'Please enter a valid email address.';
  } else if (
    key === 'confirmPassword' &&
    control.hasError('confirmedValidator')
  ) {
    errorMessage = 'Passwords do not match.';
  }

  return errorMessage;
};
