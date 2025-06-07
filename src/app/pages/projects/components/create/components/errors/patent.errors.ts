export const PATENT_FORM_ERRORS = {
  primaryAuthor: {
    required: 'Primary author is required',
  },
  coInventors: {
    required: 'At least one co-inventor is required',
  },
  registrationNumber: {
    required: 'Patent registration number is required',
  },
  registrationDate: {
    required: 'Date of registration is required',
  },
  issuingAuthority: {
    required: 'Issuing authority is required',
  },
} as const;
