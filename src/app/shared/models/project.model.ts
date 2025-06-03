import { ProjectType } from '@shared/enums/categories.enum';
import { PublicationDTO } from './publication.model';
import { PatentDTO } from './patent.model';
import { ResearchDTO } from './research.model';
import { IUser } from './user.model';

export type ProjectDTO = {
  id: string;
  type: ProjectType;
  title: string;
  description: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  tagIds: string[];
  createdBy: number;
  deletedUserId?: number;
  publication?: PublicationDTO;
  patent?: PatentDTO;
  research?: ResearchDTO;
};

interface Publication {
  source?: string;
  doiIsbn?: string;
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

export interface ProjectWithDetails {
  project: ProjectDTO;
  details: PatentDTO | PublicationDTO | ResearchDTO | null;
}

export interface ProjectWithPublication {
  project: ProjectDTO;
  publication: PublicationDTO;
}
export interface ProjectWithPatent {
  project: ProjectDTO;
  patent: PatentDTO;
}
export interface ProjectWithResearch {
  project: ProjectDTO;
  research: ResearchDTO;
}
