import { Filter } from '@shared/types/filters.types';

export const filters: Filter[] = [
  { value: 'patents', viewValue: 'Patents' },
  { value: 'research', viewValue: 'Research' },
  { value: 'development', viewValue: 'Development' },
  { value: 'testing', viewValue: 'Testing' },
];

export const sorting: Filter[] = [
  { value: 'newest', viewValue: 'Newest to oldest' },
  { value: 'oldest', viewValue: 'Oldest to newest' },
  { value: 'alphabetical', viewValue: 'Alphabetical' },
  { value: 'priority', viewValue: 'Priority' },
];

export const quickFilters: Filter[] = [
  { value: 'my-projects', viewValue: 'My projects' },
  { value: 'shared-with-me', viewValue: 'Shared with me' },
  { value: 'deadline', viewValue: 'Upcoming deadline' },
];

export const filterLayout: Filter[] = [
  { value: 'rows', viewValue: 'table_rows' },
  { value: 'grid', viewValue: 'grid_view' },
];
