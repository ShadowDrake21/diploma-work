import { Component, inject, OnInit } from '@angular/core';
import { UsersListComponent } from '@shared/components/users-list/users-list.component';
import { PaginationService } from '@core/services/pagination.service';
import { usersContent } from '@content/users.content';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-users-management',
  imports: [
    UsersListComponent,
    MatFormFieldModule,
    MatLabel,
    MatSelectModule,
    ReactiveFormsModule,
    MatInput,
    MatIcon,
    MatButtonModule,
  ],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.scss',
  providers: [PaginationService],
})
export class UsersManagementComponent implements OnInit {
  paginationService = inject(PaginationService);

  pages: number[] = [];
  users = usersContent;

  searchForm = new FormGroup({
    search: new FormControl(''),
    role: new FormControl(''),
    activity: new FormControl(''),
    sort: new FormControl(''),
  });

  ngOnInit(): void {
    this.paginationUsage();
  }

  paginationUsage() {
    this.paginationService.currentPage = 1;
    this.paginationService.elements = this.users;
    this.paginationService.itemsPerPage = 10;
    this.paginationService.updateVisibleElements();

    this.pages = Array.from(
      { length: this.paginationService.numPages() },
      (_, i) => i + 1
    );
  }

  onSearch(): void {
    console.log(this.searchForm.value);
  }
}
