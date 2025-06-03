export interface CreateResearchRequest {
  projectId: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: string;
  fundingSource: string;
  participantIds: string[];
}

export interface UpdateResearchRequest extends CreateResearchRequest {
  id: string;
}
export interface ResearchDTO
  extends Omit<UpdateResearchRequest, 'participantIds'> {
  participantIds: number[];
}
