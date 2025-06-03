import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'projectProgressColor',
})
export class ProjectProgressColorPipe implements PipeTransform {
  transform(progress: number): 'warn' | 'accent' | 'primary' {
    if (progress < 50) {
      return 'warn';
    } else if (progress < 80) {
      return 'accent';
    } else {
      return 'primary';
    }
  }
}
