import { ProjectType } from '@shared/enums/categories.enum';
import { PublicationDTO } from './publication.model';
import { PatentDTO } from './patent.model';
import { ResearchDTO } from './research.model';
import { Tag } from './tag.model';

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

export interface ProjectResponse
  extends Omit<ProjectDTO, 'creator' | 'tagIds'> {
  tag: Tag[];
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ProjectWithDetails {
  project: ProjectDTO;
  details: PatentDTO | PublicationDTO | ResearchDTO | null;
}
