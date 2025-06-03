import { ResponseUserDTO } from './user.model';

export interface CreatePublicationRequest {
  projectId: string;
  publicationDate: string;
  publicationSource: string;
  doiIsbn: string;
  startPage: number;
  endPage: number;
  journalVolume: number;
  issueNumber: number;
  authors: number[];
}

export interface UpdatePublicationRequest {
  id: string;
  projectId: string;
  publicationDate: string;
  publicationSource: string;
  doiIsbn: string;
  startPage: number;
  endPage: number;
  journalVolume: number;
  issueNumber: number;
  authors: number[];
}

export interface PublicationDTO
  extends Omit<UpdatePublicationRequest, 'authors'> {
  authors: ResponseUserDTO[];
}
