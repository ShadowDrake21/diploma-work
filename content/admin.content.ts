import { DashboardMetricCardItem } from '@shared/types/dashboard.types';

export const AdminUserMetrics: DashboardMetricCardItem[] = [
  {
    title: 'Total Users',
    value: '100',
    icon: 'group',
  },
  {
    title: 'Active Users in last 24 hours',
    value: '100',
    icon: 'person_add',
  },
  { title: 'New user registration', value: '100', icon: 'how_to_reg' },
];

export const AdminContentMetrics: DashboardMetricCardItem[] = [
  {
    title: 'Total Products',
    value: '100',
    icon: 'category',
  },
  {
    title: 'Total Publications',
    value: '100',
    icon: 'description',
  },
  { title: 'Total Patents', value: '100', icon: 'gavel' },
  {
    title: 'Total Research Projects',
    value: '100',
    icon: 'science',
  },
  { title: 'Active projects', value: '100', icon: 'add_alert' },
  {
    title: 'Pending approvals',
    value: '100',
    icon: 'pending',
  },
  {
    title: 'Reported content',
    value: '100',
    icon: 'report',
  },
];

export const AdminEngagementMetrics: DashboardMetricCardItem[] = [
  {
    title: 'Total Comments',
    value: '100',
    icon: 'chat',
  },
  {
    title: 'Most commented project',
    value: 'Something',
    icon: 'star',
  },
  {
    title: 'Most viewed projects',
    value: 'Something',
    icon: 'visibility',
  },
];
