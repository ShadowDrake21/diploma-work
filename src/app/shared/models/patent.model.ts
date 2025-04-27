import { IUser } from '../types/users.types';

export interface PatentDTO {
  id: string;
  projectId: string;
  primaryAuthorId: number;
  primaryAuthor: IUser;
  registrationNumber: string;
  registrationDate: Date;
  issuingAuthority: string;
  coInventors: number[];
}

export interface CreatePatentRequest {
  projectId: string;
  primaryAuthorId: number;
  registrationNumber: string;
  registrationDate: Date | string;
  issuingAuthority: string;
  coInventors: number[];
}

export interface UpdatePatentRequest extends Partial<CreatePatentRequest> {
  id: string;
}

export interface PatentCoInventorDTO {
  id: number;
  userId: number;
  userName: string;
}
