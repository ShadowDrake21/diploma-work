export type DashboardMetricCardItem = {
  icon: string;
  title: string;
  value: string;
  link?: string;
};

export type DashboardRecentProjectItem = {
  id: number;
  projectTitle: string;
  deadline: string;
  statusProgress: string;
  progress: number;
  assignedTeamMembers: string[];
};

export interface DashboardRecentProjectItemModal {
  id: number;
  type: 'publication' | 'research project' | 'patent';
  projectTitle: string;
  deadline: string;
  statusProgress: string;
  progress: number;
  assignedTeamMembers: string[];
  shortDescription?: string;
  priorityLevel?: 'High' | 'Medium' | 'Low';
  creationDate?: string;
  lastUpdated?: string;
  tags?: string[];
  contact?: {
    name: string;
    email: string;
  };
  files?: string[];
}

export interface DashboardMetrics {
  totalProjects: number;
  totalPublications: number;
  totalPatents: number;
  totalResearch: number;
  totalUsers: number;
}
