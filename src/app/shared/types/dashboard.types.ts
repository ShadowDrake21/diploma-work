export type DashboardMetricCardItem = {
  icon: string;
  title: string;
  value: string;
  link?: string;
};

export interface DashboardMetrics {
  totalProjects: number;
  totalPublications: number;
  totalPatents: number;
  totalResearch: number;
  totalUsers: number;
}
