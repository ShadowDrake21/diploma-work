export const RESEARCH_PROJECT_ERRORS = {
  participantIds: {
    required: 'At least one participant is required',
  },
  budget: {
    required: 'Budget amount is required',
    min: 'Budget cannot be negative',
  },
  startDate: {
    required: 'Start date is required',
    beforeEnd: 'Start date must be before end date',
  },
  endDate: {
    required: 'End date is required',
    beforeStart: 'End date must be after start date',
  },
  status: {
    required: 'Project status is required',
  },
  fundingSource: {
    required: 'Funding source is required',
  },
} as const;
