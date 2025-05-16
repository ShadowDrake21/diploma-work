import { IProfile } from '@shared/types/dropmenu.types';

export const profileMenuItems: IProfile[] = [
  {
    title: 'Profile',
    link: '/my-profile',
    icon: 'account_circle',
  },
  {
    title: 'My comments',
    link: '/my-comments',
    icon: 'comment',
  },
  {
    title: 'Settings',
    link: '/settings',
    icon: 'settings',
  },
];
