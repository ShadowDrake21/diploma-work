import { FormControl } from '@angular/forms';

export const getFieldName = (key: string): string => {
  switch (key) {
    case 'name':
      return "Ім'я";
    case 'email':
      return 'Електронна пошта';
    case 'password':
      return 'Пароль';
    case 'confirmPassword':
      return 'Підтвердження пароля';
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
    errorMessage = `${getFieldName(key)} є обов'язковим.`;
  } else if (control.hasError('minlength')) {
    errorMessage = `${getFieldName(key)} має бути щонайменше ${
      control.errors?.['minlength'].requiredLength
    } символів.`;
  } else if (control.hasError('maxlength')) {
    errorMessage = `${getFieldName(key)} не може перевищувати ${
      control.errors?.['maxlength'].requiredLength
    } символів.`;
  } else if (key === 'email' && control.hasError('email')) {
    errorMessage = 'Будь ласка, введіть дійсну електронну адресу.';
  } else if (
    key === 'confirmPassword' &&
    control.hasError('confirmedValidator')
  ) {
    errorMessage = 'Паролі не співпадають.';
  }

  return errorMessage;
};
