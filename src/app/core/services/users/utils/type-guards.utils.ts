import { IUser } from '@models/user.model';

export function isUserArray(
  result: IUser[] | { error: { message: string } } | null
): result is IUser[] {
  return Array.isArray(result);
}
