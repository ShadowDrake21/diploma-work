import { ProjectType } from '@shared/enums/categories.enum';
import { PublicationDTO } from './publication.model';
import { PatentDTO } from './patent.model';
import { User } from './user.model';
import { ResearchDTO } from './research.model';

export type ProjectDTO = {
  id: string;
  type: ProjectType;
  title: string;
  description: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  tagIds: string[];
  creator: User;
  publication?: PublicationDTO;
  patent?: PatentDTO;
  research?: ResearchDTO;
};

interface Publication {
  source?: string;
  doiIsbn?: string;
}

interface Patent {
  registrationNumber?: string;
  issuingAuthority?: string;
}

interface Research {
  budget?: number;
  fundingSource?: string;
}

export type CreateProjectRequest = {
  title: string;
  description: string;
  type: ProjectType;
  progress: number;
  tagIds: string[];
  createdBy: number;
};

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  progress?: number;
  tagIds?: string[];
  type?: ProjectType;
}

export interface SearchProjectResponse {
  items: ProjectDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProjectResponse
  extends Omit<ProjectDTO, 'creator' | 'tagIds'> {
  tag: Tag[];
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}
