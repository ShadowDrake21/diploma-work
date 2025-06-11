export const PUBLICATION_FORM_ERRORS = {
  authors: {
    required: 'Потрібен принаймні один автор',
  },
  publicationDate: {
    required: 'Потрібно вказати дату публікації',
    futureDate: 'Дата публікації не може бути в майбутньому',
  },
  publicationSource: {
    required: 'Потрібне джерело публікації',
  },
  doiIsbn: {
    required: 'DOI/ISBN є обов’язковим',
    pattern: 'Будь ласка, введіть дійсний DOI або ISBN',
  },
  startPage: {
    required: 'Початкова сторінка обовʼязкова',
    min: 'Початкова сторінка має бути принаймні 1',
    invalidRange: 'Початкова сторінка має бути меншою за кінцеву сторінку',
  },
  endPage: {
    required: 'Кінцева сторінка обовʼязкова',
    min: 'Кінцева сторінка має бути принаймні 1',
    invalidRange: 'Кінцева сторінка має бути більшою за початкову',
  },
  journalVolume: {
    required: 'Обсяг журналу обовʼязковий',
    min: 'Обсяг журналу має бути щонайменше 1',
  },
  issueNumber: {
    required: 'Номер випуску обовʼязковий',
    min: 'Номер проблеми має бути щонайменше 1',
  },
} as const;
