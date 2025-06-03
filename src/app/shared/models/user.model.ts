import { UserRole, UserType } from '@shared/enums/user.enum';

export interface IUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  affiliation: string;
  dateOfBirth?: string | Date;
  userType?: UserType;
  universityGroup?: string;
  phoneNumber?: string;
  publicationCount: number;
  patentCount: number;
  researchCount: number;
  lastActive?: string | Date;
  tags: string[];
  active: boolean;
  createdAt?: string | Date;
  verified?: boolean;
  socialLinks?: SocialLink[];
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
  socialLinks?: SocialLink[];
}

export interface ResponseUserDTO {
  id: number;
  username: string;
}

export interface SocialLink {
  url: string;
  name: string;
}
