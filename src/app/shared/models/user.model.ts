export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum UserType {
  STUDENT = 'student',
  TEACHER = 'teacher',
  RESEARCHER = 'researcher',
  STAFF = 'staff',
}

export interface IUser {
  id: number;
  username: string;
  avatarUrl: string;
  role: UserRole;
  affiliation: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  userType: UserType;
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
  userType?: UserType;
  universityGroup?: string;
  avatarUrl?: string;
}

export interface ResponseUserDTO {
  id: number;
  username: string;
}
