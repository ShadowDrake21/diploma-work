import { Filter } from '@shared/types/filters.types';

export const types: Filter[] = [
  { value: 'PUBLICATION', viewValue: 'Publication' },
  { value: 'PATENT', viewValue: 'Patent' },
  { value: 'RESEARCH', viewValue: 'Research Project' },
];

export const statuses: Filter[] = [
  { value: 'proposed', viewValue: 'Proposed' },
  { value: 'in-progress', viewValue: 'In Progress' },
  { value: 'completed', viewValue: 'Completed' },
  { value: 'cancelled', viewValue: 'Cancelled' },
];
