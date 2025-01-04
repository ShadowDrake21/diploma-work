import { Component, input, output } from '@angular/core';

@Component({
  selector: 'shared-pagination',
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  currentPageSig = input.required<number>({ alias: 'currentPage' });
  pagesSig = input.required<number[]>({ alias: 'pages' });

  prevPage = output<void>();
  nextPage = output<void>();
  goToPage = output<number>();
}
