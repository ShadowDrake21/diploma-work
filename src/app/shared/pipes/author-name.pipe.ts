import { Pipe, PipeTransform } from '@angular/core';
import { BaseFormInputs } from '@shared/types/project-form.types';

@Pipe({
  name: 'authorName',
})
export class AuthorNamePipe implements PipeTransform {
  transform(
    authorId: string,
    users: BaseFormInputs['allUsers'] | null | undefined
  ): string {
    if (!authorId || !users) return '';

    const author = users.find(
      (user) => user.id.toString() === authorId.toString()
    );
    console.log('author', author);
    return author ? author.username : '';
  }
}
