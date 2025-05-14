export interface IJwtPayload {
  sub: string; // Typically the user's email
  userId: number;
  iat: number; // Issued at
  exp: number; // Expiration time
}
