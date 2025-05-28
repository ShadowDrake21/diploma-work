import { IUser } from '@models/user.model';

export interface AuthResponse {
  message: string;
  authToken: string;
}

export interface ContentStatistics {
  totalProjects: number;
  totalPublications: number;
  totalPatents: number;
  totalResearch: number;
  totalComments: number;
  totalAttachments: number;
}

export interface AdminActivity {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  performedAt: Date;
  details: string;
}
