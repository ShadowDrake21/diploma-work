import { Pipe, PipeTransform } from '@angular/core';
import { ProjectType } from '@shared/enums/categories.enum';

@Pipe({
  name: 'projectTypeName',
})
export class ProjectTypeNamePipe implements PipeTransform {
  transform(type: ProjectType): string {
    return ProjectType[type];
  }
}
