import { Component, inject, input, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { PaginationComponent } from '../pagination/pagination.component';
import { PaginationService } from '@core/services/pagination.service';
import { UserCardComponent } from '../user-card/user-card.component';
import { MatFormField, MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'shared-users-list',
  imports: [
    MatListModule,
    PaginationComponent,
    UserCardComponent,
    MatSelectModule,
    MatButtonModule,
    MatFormField,
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
  providers: [PaginationService],
})
export class UsersListComponent {
  private router = inject(Router);
  paginationServiceSig = input.required<PaginationService>({
    alias: 'paginationService',
  });
  pages = input.required<number[]>({
    alias: 'pages',
  });

  typeSig = input.required<'general' | 'admin'>({ alias: 'type' });

  editUser(user: any) {}

  deleteUser(user: any) {}
}
