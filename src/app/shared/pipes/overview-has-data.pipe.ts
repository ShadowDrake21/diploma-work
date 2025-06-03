import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'overviewHasData',
})
export class OverviewHasDataPipe implements PipeTransform {
  transform(value: { value: number }[]): boolean {
    return value?.some((item) => item.value > 0) ?? false;
  }
}
