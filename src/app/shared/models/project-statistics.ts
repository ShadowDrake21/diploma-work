export interface ProjectStatistics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  publicationsCount: number;
  patentsCount: number;
  researchCount: number;
  projectsByStatus: Record<string, number>;
  projectsByType: Record<string, number>;
}
