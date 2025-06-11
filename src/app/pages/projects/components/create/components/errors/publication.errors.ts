export const PUBLICATION_FORM_ERRORS = {
  authors: {
    required: 'At least one author is required',
  },
  publicationDate: {
    required: 'Publication date is required',
    futureDate: 'Publication date cannot be in the future',
  },
  publicationSource: {
    required: 'Publication source is required',
  },
  doiIsbn: {
    required: 'DOI/ISBN is required',
    pattern: 'Please enter a valid DOI or ISBN',
  },
  startPage: {
    required: 'Start page is required',
    min: 'Start page must be at least 1',
    invalidRange: 'Start page must be less than end page',
  },
  endPage: {
    required: 'End page is required',
    min: 'End page must be at least 1',
    invalidRange: 'End page must be greater than start page',
  },
  journalVolume: {
    required: 'Journal volume is required',
    min: 'Journal volume must be at least 1',
  },
  issueNumber: {
    required: 'Issue number is required',
    min: 'Issue number must be at least 1',
  },
} as const;
