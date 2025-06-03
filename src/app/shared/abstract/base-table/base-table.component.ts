import {
  Component,
  computed,
  effect,
  Input,
  input,
  output,
  signal,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Pagination } from '@shared/types/util.types';

@Component({
  selector: 'app-base-table',
  imports: [],
  templateUrl: './base-table.component.html',
  styleUrl: './base-table.component.scss',
})
export abstract class BaseTableComponent<T> {
  readonly dataSource = input<T[]>([]);
  readonly pagination = input<Pagination>({ page: 0, size: 10, total: 0 });

  readonly pageChange = output<PageEvent>();
  readonly edit = output<T>();
  readonly delete = output<string>();

  readonly paginatedData = computed(() => {
    const { page, size } = this.pagination();
    const data = this.dataSource();
    const start = page * size;
    return data.slice(start, start + size);
  });

  abstract displayedColumns: string[];

  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }

  onEdit(item: T) {
    this.edit.emit(item);
  }

  onDelete(id: string) {
    this.delete.emit(id);
  }
}
