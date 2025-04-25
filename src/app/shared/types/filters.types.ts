export interface Filter {
  value: string;
  viewValue: string;
}

export interface ProjectFilters {
  source?: string;
  doiIsbn?: string;
  registrationNumber?: string;
  issuingAuthority?: string;
  minBudget?: number;
  maxBudget?: number;
  fundingSource?: string;
}
