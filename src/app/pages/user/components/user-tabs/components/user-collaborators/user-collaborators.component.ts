import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { UserService } from '@core/services/users/user.service';
import { UserCardComponent } from '@shared/components/user-card/user-card.component';
import { IUser } from '@shared/models/user.model';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'user-collaborators',
  imports: [CommonModule, UserCardComponent, MatListModule, MatPaginatorModule],
  templateUrl: './user-collaborators.component.html',
  styleUrl: './user-collaborators.component.scss',
})
export class UserCollaboratorsComponent {
  private userService = inject(UserService);
  userId = input.required<number>();

  collaborators = signal<IUser[]>([]);
  totalItems = signal(0);
  pageSize = signal(10);
  currentPage = signal(0);

  constructor() {
    effect(() => {
      const userId = this.userId();
      if (userId) {
        this.loadCollaborators(userId, this.currentPage(), this.pageSize());
      }
    });
  }

  private loadCollaborators(userId: number, page: number, size: number): void {
    this.userService
      .getUserCollaborators(userId, page, size)
      .pipe(
        catchError(() =>
          of({
            data: [],
            totalItems: 0,
            page: 0,
            totalPages: 0,
            hasNext: false,
          })
        )
      )
      .subscribe((response) => {
        this.collaborators.set(response.data);
        this.totalItems.set(response.totalItems);
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadCollaborators(this.userId(), event.pageIndex, event.pageSize);
  }
}
