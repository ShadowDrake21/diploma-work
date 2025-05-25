import { signal } from '@angular/core';
import { IUser } from '@models/user.model';

export const currentUserSig = signal<IUser | null>(null);
