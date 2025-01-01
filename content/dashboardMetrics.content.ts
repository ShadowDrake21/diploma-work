import { DashboardMetricCardItem } from '../src/app/shared/types/dashboard.types';

export const DashboardMetricsContent: DashboardMetricCardItem[] = [
  {
    title: 'Total Products',
    value: '100',
    icon: 'category',
    link: '/products',
  },
  {
    title: 'Total Publications',
    value: '100',
    icon: 'description',
    link: '/publications',
  },
  { title: 'Total Patents', value: '100', icon: 'gavel', link: '/patents' },
  {
    title: 'Total Research Projects',
    value: '100',
    icon: 'science',
    link: '/research-projects',
  },
  { title: 'Pending Tasks', value: '100', icon: 'task', link: '/tasks' },
  {
    title: 'Notifications',
    value: '100',
    icon: 'notifications',
    link: '/notifications',
  },
];
