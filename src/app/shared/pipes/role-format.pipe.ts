import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleFormat',
})
export class RoleFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    return value
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
