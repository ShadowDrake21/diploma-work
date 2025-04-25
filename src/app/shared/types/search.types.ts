export interface ProjectSearchResponse {
  content: ProjectInterface[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: any;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface ProjectInterface {
  id: string;
  type: string;
  title: string;
  description: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

export interface Tag {
  id: string;
  name: string;
}
