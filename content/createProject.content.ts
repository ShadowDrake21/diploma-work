import { Filter } from '@shared/types/filters.types';

export const types: Filter[] = [
  { value: 'publication', viewValue: 'Publication' },
  { value: 'patent', viewValue: 'Patent' },
  { value: 'research', viewValue: 'Research Project' },
];

export const authors: string[] = [
  'Dmytro Krapyvianskyi',
  'Amelia Kastelik',
  'John Doe',
  'Michael Jackson',
];

export const statuses: Filter[] = [
  { value: 'proposed', viewValue: 'Proposed' },
  { value: 'in-progress', viewValue: 'In Progress' },
  { value: 'completed', viewValue: 'Completed' },
  { value: 'cancelled', viewValue: 'Cancelled' },
];
