export interface ILoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface IVerifyRequest {
  email: string;
  code: string;
}

export interface IRequestPasswordReset {
  email: string;
}

export interface IResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface IAuthResponse {
  message: string;
  authToken: string;
}
