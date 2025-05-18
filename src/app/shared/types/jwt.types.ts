export interface IJwtPayload {
  sub: string;
  userId: number;
  iat: number;
  exp: number;
  rememberMe?: boolean;
}
