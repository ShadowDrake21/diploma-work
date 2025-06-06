import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardMetricCardItem } from '@shared/types/dashboard.types';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'shared-metric-card-item',
  imports: [CommonModule, RouterLink, MatIcon],
  template: `
    <a
      class="flex justify-center sm:justify-between items-center no-underline bg-black px-5 lg:px-[30px] py-[7px] lg:py-[15px] min-w-full  sm:min-w-[250px] xl:min-w-[300px] border-[2px] border-solid border-gray-300  text-white gap-[10px]"
      routerLink="{{ data().link || '' }}"
    >
      <mat-icon>{{ data().icon }}</mat-icon>

      <div
        class="text-base hidden min-[450px]:block  min-[900px]:text-lg lg:text-xl leading-5 lg:leading-6 text-center "
      >
        {{ data().title }}
      </div>

      <div
        class="text-xl min-[900px]:text-2xl lg:text-[26px] leading-7 lg:leading-8 font-bold "
      >
        {{ data().value }}
      </div>
    </a>
  `,
  host: {
    style: 'display: flex; height: 100%;',
  },
})
export class MetricCardItemComponent {
  data = input.required<DashboardMetricCardItem>();
}
