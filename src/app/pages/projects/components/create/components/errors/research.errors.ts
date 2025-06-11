export const RESEARCH_PROJECT_ERRORS = {
  participantIds: {
    required: 'Потрібен щонайменше один учасник',
  },
  budget: {
    required: 'Потрібно вказати суму бюджету',
    min: 'Бюджет не може бути відʼємним',
  },
  startDate: {
    required: 'Потрібно вказати дату початку',
    beforeEnd: 'Дата початку має бути раніше дати завершення',
  },
  endDate: {
    required: 'Дата завершення обовʼязкова',
    beforeStart: 'Дата завершення має бути після дати початку',
  },
  status: {
    required: 'Потрібно вказати статус проекту',
  },
  fundingSource: {
    required: 'Джерело фінансування обовʼязкове',
  },
} as const;
