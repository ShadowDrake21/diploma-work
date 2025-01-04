import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class PaginationService {
  itemsPerPage: number = 5;
  currentPage: number = 1;

  elements: any[] = [];
  visibleElements: any[] = [];

  updateVisibleElements() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.visibleElements = this.elements.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.numPages()) {
      this.currentPage++;
      this.updateVisibleElements();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateVisibleElements();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.numPages()) {
      this.currentPage = page;
      this.updateVisibleElements();
    }
  }

  numPages(): number {
    return Math.ceil(this.elements.length / this.itemsPerPage);
  }
}
