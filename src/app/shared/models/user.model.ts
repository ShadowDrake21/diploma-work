export interface IUser {
  id: number;
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
  publicationCount: number;
  patentCount: number;
  researchCount: number;
  lastActive: string;
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

export interface ResponseUserDTO {
  id: number;
  username: string;
}
