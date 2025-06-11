import { ProjectType } from '@shared/enums/categories.enum';

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
