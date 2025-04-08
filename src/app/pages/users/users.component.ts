import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { usersContent } from '@content/users.content';
import { UserCardComponent } from '../../shared/components/user-card/user-card.component';
import { PaginationService } from '@core/services/pagination.service';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { IUser } from '@shared/types/users.types';
import { debounce, debounceTime, distinctUntilChanged } from 'rxjs';
import { UsersListComponent } from '../../shared/components/users-list/users-list.component';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatListModule,
    MatChipsModule,

    UsersListComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  providers: [PaginationService],
})
export class UsersComponent implements OnInit {
  paginationService = inject(PaginationService);
  searchControl = new FormControl('');

  pages: number[] = [];
  users = usersContent;
  elements: IUser[] = [];

  ngOnInit(): void {
    this.paginationUsage();
    this.searchControl.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe((value) => {
        if (!value || value === '') {
          this.paginationService.currentPage = 1;
          this.paginationService.elements = this.users;
          this.paginationService.updateVisibleElements();
          return;
        }
        this.search(value);
      });
  }

  search(value: string) {
    this.paginationService.currentPage = 1;
    this.paginationService.elements = this.users.filter((user) =>
      user.username.toLowerCase().includes(value.toLowerCase())
    );
    this.paginationService.itemsPerPage = 10;
    this.paginationService.updateVisibleElements();
    this.elements = this.paginationService.visibleElements;

    this.pages = Array.from(
      { length: this.paginationService.numPages() },
      (_, i) => i + 1
    );
  }

  paginationUsage() {
    this.paginationService.currentPage = 1;
    this.paginationService.elements = this.users;
    this.paginationService.itemsPerPage = 10;
    this.paginationService.updateVisibleElements();
    this.elements = this.paginationService.visibleElements;

    this.pages = Array.from(
      { length: this.paginationService.numPages() },
      (_, i) => i + 1
    );
  }
}
