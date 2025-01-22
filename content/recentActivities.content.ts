export interface IUserActivities {
  position: number;
  user: string;
  activity: string;
}

export const USERS_ACTIVITIES: IUserActivities[] = [
  { position: 1, user: 'Edward D. Drake', activity: 'Updated profile' },
  { position: 2, user: 'Edward D. Drake', activity: 'Updated profile' },
  { position: 3, user: 'Edward D. Drake', activity: 'Updated profile' },
  { position: 4, user: 'Edward D. Drake', activity: 'Updated profile' },
  { position: 5, user: 'Edward D. Drake', activity: 'Updated profile' },
  { position: 6, user: 'Edward D. Drake', activity: 'Updated profile' },
];

export interface INewProjectActivities {
  position: number;
  user: string;
  project: string;
  date: string;
}

export const NEW_PROJECTS_ACTIVITIES: INewProjectActivities[] = [
  {
    position: 1,
    user: 'Edward D. Drake',
    project: 'New project 1',
    date: new Date().toISOString(),
  },
  {
    position: 2,
    user: 'Edward D. Drake',
    project: 'New project 2',
    date: new Date().toISOString(),
  },
  {
    position: 3,
    user: 'Edward D. Drake',
    project: 'New project 3',
    date: new Date().toISOString(),
  },
  {
    position: 4,
    user: 'Edward D. Drake',
    project: 'New project 4',
    date: new Date().toISOString(),
  },
  {
    position: 5,
    user: 'Edward D. Drake',
    project: 'New project 5',
    date: new Date().toISOString(),
  },
  {
    position: 6,
    user: 'Edward D. Drake',
    project: 'New project 6',
    date: new Date().toISOString(),
  },
  {
    position: 7,
    user: 'Edward D. Drake',
    project: 'New project 7',
    date: new Date().toISOString(),
  },
];
