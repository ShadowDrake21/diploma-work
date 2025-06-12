import { Pipe, PipeTransform } from '@angular/core';
import { ProjectType } from '@shared/enums/categories.enum';

@Pipe({
  name: 'localProjectType',
})
export class LocalProjectTypePipe implements PipeTransform {
  transform(type: ProjectType): unknown {
    return type === ProjectType.PUBLICATION
      ? 'Публікація'
      : type === ProjectType.PATENT
      ? 'Патент'
      : type === ProjectType.RESEARCH
      ? 'Дослідження'
      : 'Невідомий тип';
  }
}
