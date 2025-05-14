import { ApiResponse } from './api-response.model';

export interface Tag {
  id: string;
  name: string;
}

export interface TagDTO {
  id?: string;
  name: string;
}

export type TagApiResponse = ApiResponse<Tag>;
export type TagListApiResponse = ApiResponse<Tag[]>;
