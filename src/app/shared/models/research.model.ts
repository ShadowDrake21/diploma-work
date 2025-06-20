export interface CreateResearchRequest {
  projectId: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: ResearchStatuses;
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

export enum ResearchStatuses {
  PROPOSED = 'proposed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
