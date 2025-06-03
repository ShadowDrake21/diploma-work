import { Pipe, PipeTransform } from '@angular/core';
import { currentUserSig } from '@core/shared/shared-signals';

@Pipe({
  name: 'isCurrentUser',
})
export class IsCurrentUserPipe implements PipeTransform {
  transform(userId: number | undefined): boolean {
    const currentUser = currentUserSig();
    return !!currentUser && currentUser.id === userId;
  }
}
