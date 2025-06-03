export interface ApiError {
  message: string;
  errorCode: string | null; // Matches your backend's 'errorCode' field
  status: number;
  timestamp?: string; // Optional since it comes from backend
  details?: any;
}
