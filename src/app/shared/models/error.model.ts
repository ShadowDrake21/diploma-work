export interface ApiError {
  message: string;
  errorCode: string | null;
  status: number;
  timestamp?: string;
  details?: any;
}
