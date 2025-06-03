import { Component, input, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { UserCardComponent } from '../user-card/user-card.component';
import { MatFormField, MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { IUser } from '@models/user.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'shared-users-list',
  imports: [
    MatListModule,
    UserCardComponent,
    MatSelectModule,
    MatButtonModule,
    MatFormField,
    MatPaginatorModule,
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersListComponent {
  users = input.required<IUser[]>();
  type = input.required<'general' | 'admin'>();
  pageSize = input(10);
  totalItems = input.required<number>();

  currentPage = signal(0);
  pageSizeInternal = signal(this.pageSize());

  handlePageEvent(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageSizeInternal.set(event.pageSize);
  }

  get paginatedUsers() {
    const startIndex = this.currentPage() * this.pageSizeInternal();
    const endIndex = startIndex + this.pageSizeInternal();
    return this.users().slice(startIndex, endIndex);
  }

  editUser(user: any) {}

  deleteUser(user: any) {}
}
