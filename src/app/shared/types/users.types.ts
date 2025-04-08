export interface IUser {
  id: string;
  username: string;
  avatarUrl: string;
  role: string;
  affiliation: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  userType: 'student' | 'teacher' | 'researcher' | 'staff';
  universityGroup: string;
  phoneNumber?: string;
  publications: number;
  patents: number;
  ongoingProjects: number;
  lastActive: string;
  status: string;
  tags: string[];
}

export interface ICreateUser {
  email: string;
  password: string;
  role: string;
}

export interface IAuthorizedUser {
  id: number;
  email: string;
  role: string;
}

export interface IUpdateUserProfile {
  phoneNumber?: string;
  dateOfBirth?: string;
  userType?: 'student' | 'teacher' | 'researcher' | 'staff';
  universityGroup?: string;
  avatarUrl?: string;
}
