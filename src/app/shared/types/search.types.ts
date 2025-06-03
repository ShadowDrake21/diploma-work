import { ProjectDTO, Tag } from '@models/project.model';
import { ProjectType } from '@shared/enums/categories.enum';

export interface ProjectSearchResponse {
  content: ProjectDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
export interface ProjectInterface {
  id: string;
  type: string;
  title: string;
  description: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

export interface ProjectSearchFilters {
  search?: string;
  types?: ProjectType[];
  tags?: string[];
  startDate?: string;
  endDate?: string;
  progressMin?: number;
  progressMax?: number;
  publicationSource?: string;
  doiIsbn?: string;
  minBudget?: number;
  maxBudget?: number;
  fundingSource?: string;
  registrationNumber?: string;
  issuingAuthority?: string;
  statuses?: string[];
}
