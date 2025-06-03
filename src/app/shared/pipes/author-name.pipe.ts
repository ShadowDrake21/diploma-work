import { Pipe, PipeTransform } from '@angular/core';
import { BaseFormInputs } from '@shared/types/forms/project-form.types';

@Pipe({
  name: 'authorName',
})
export class AuthorNamePipe implements PipeTransform {
  transform(
    authorId: number,
    users: BaseFormInputs['allUsers'] | null | undefined
  ): string | null {
    if (!authorId || !users) return null;

    const author = users.find((user) => user.id === authorId);
    console.log('author', author);
    return author ? author.username : '';
  }
}
