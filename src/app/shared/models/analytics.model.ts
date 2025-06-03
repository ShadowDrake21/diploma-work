export interface SystemOverviewDTO {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  activeSessions: number;
  pendingAdminInvitations: number;
}

export interface UserGrowthDTO {
  date: Date;
  newUsers: number;
  activeUsers: number;
}

export interface ProjectDistributionDTO {
  publicationCount: number;
  patentCount: number;
  researchCount: number;
}

export interface ProjectProgressDTO {
  progress: number;
  count: number;
}

export interface PublicationMetricsDTO {
  totalPublications: number;
  averagePages: number;
  mostCommonSource: string;
  publicationsThisYear: number;
}

export interface PatentMetricsDTO {
  totalPatents: number;
  averageInventors: number;
  mostCommonAuthority: string;
  patentsThisYear: number;
}

export interface ResearchFundingDTO {
  totalBudget: number;
  averageBudget: number;
  mostCommonFundingSource: string;
  activeProjects: number;
}

export interface CommentActivityDTO {
  date: Date;
  newComments: number;
  likes: number;
}

export interface SystemPerformanceDTO {
  averageResponseTime: number;
  uptimePercentage: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  activeDbConnections: number;
  idleDbConnections: number;
  maxDbConnections: number;
  threadCount: number;
}

export interface ChartSeries {
  name: string;
  value: number;
}
export interface NamedChartSeries {
  name: string;
  series: ChartSeries[];
}
