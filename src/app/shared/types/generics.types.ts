export interface PageResponse<T> {
  success: boolean;
  message: string;
  timestamp: string;
  data: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
}
