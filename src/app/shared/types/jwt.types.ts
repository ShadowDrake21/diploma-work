import { UserRole } from '@shared/enums/user.enum';

export interface IJwtPayload {
  sub: string;
  userId: number;
  iat: number;
  exp: number;
  rememberMe?: boolean;
  role: UserRole;
}
