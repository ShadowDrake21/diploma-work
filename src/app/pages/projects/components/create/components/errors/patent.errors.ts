export const PATENT_FORM_ERRORS = {
  primaryAuthor: {
    required: 'Потрібно вказати основного автора',
  },
  coInventors: {
    required: 'Потрібен принаймні один співвинахідник',
  },
  registrationNumber: {
    required: 'Потрібно вказати номер реєстрації патенту',
  },
  registrationDate: {
    required: 'Дата реєстрації обовʼязкова',
  },
  issuingAuthority: {
    required: 'Потрібен орган, який видав документ',
  },
} as const;
