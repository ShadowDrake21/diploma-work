import { Injectable } from '@angular/core';
import { authors } from '@content/createProject.content';

@Injectable({
  providedIn: 'root',
})
export class CreateWorkService {
  public _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return authors.filter((author) =>
      author.toLowerCase().includes(filterValue)
    );
  }
}
