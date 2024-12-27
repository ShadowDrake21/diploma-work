export type DashboardMetricCardItem = {
  icon: string;
  title: string;
  value: string;
  link: string;
};

export type DashboardRecentProjectItem = {
  projectTitle: string;
  deadline: string;
  statusProgress: string;
  progress: string;
  assignedTeamMembers: string[];
};
