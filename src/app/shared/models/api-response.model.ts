export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
}
