export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: Date;
  path?: string;
}
