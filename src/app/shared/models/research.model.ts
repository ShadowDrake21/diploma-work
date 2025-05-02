import { ResponseUserDTO, User } from './user.model';

export interface ResearchDTO {
  id: string;
  projectId: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: string;
  fundingSource: string;
  participantIds: number[];
}

export interface CreateResearchRequest {
  projectId: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: string;
  fundingSource: string;
  participantIds: number[];
}

export interface UpdateResearchRequest extends CreateResearchRequest {
  id: string;
}
export interface ResearchResponse
  extends Omit<UpdateResearchRequest, 'participantIds'> {
  participants: ResponseUserDTO[];
}
