import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isNan',
})
export class IsNanPipe implements PipeTransform {
  transform(value: unknown): boolean {
    return typeof value === 'number' && isNaN(value);
  }
}
