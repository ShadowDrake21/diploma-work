import { IUser } from '@models/user.model';

export interface AdminInviteRequest {
  email: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

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
