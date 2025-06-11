import { Filter } from '@shared/types/filters.types';

export const types: Filter[] = [
  { value: 'PUBLICATION', viewValue: 'Публікації' },
  { value: 'PATENT', viewValue: 'Патенти' },
  { value: 'RESEARCH', viewValue: 'Дослідницькі проєкти' },
];

export const statuses: Filter[] = [
  { value: 'proposed', viewValue: 'Запропоновано' },
  { value: 'in-progress', viewValue: 'У процесі' },
  { value: 'completed', viewValue: 'Завершено' },
  { value: 'cancelled', viewValue: 'Скасовано' },
];
