import { Component, inject, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { PaginationComponent } from '../pagination/pagination.component';
import { PaginationService } from '@core/services/pagination.service';
import { UserCardComponent } from '../user-card/user-card.component';

@Component({
  selector: 'shared-users-list',
  imports: [MatListModule, PaginationComponent, UserCardComponent],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
  providers: [PaginationService],
})
export class UsersListComponent {
  paginationServiceSig = input.required<PaginationService>({
    alias: 'paginationService',
  });
  pages = input.required<number[]>({
    alias: 'pages',
  });
}
