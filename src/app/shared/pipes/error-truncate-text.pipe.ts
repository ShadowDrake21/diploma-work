import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'errorTruncateText',
})
export class ErrorTruncateTextPipe implements PipeTransform {
  transform(value: string, limit: number = 100, trail: string = '...'): string {
    if (!value) return '';

    const effectiveLimit = window.innerWidth < 768 ? limit / 2 : limit;

    return value.length > effectiveLimit
      ? value.substring(0, effectiveLimit) + trail
      : value;
  }
}
