import { IUser } from '@models/user.model';

export interface AdminInviteRequest {
  email: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  authToken: string;
}
