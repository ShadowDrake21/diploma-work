import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
// import { usersContent } from '@content/users.content';
import { UsersListComponent } from '@shared/components/users-list/users-list.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'admin-dashboard-search-users',
  imports: [
    ReactiveFormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatFormFieldModule,
    UsersListComponent,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './search-users.component.html',
  styleUrl: './search-users.component.scss',
})
export class SearchUsersComponent {
  // users = usersContent;
  pages: number[] = [];

  userForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    role: new FormControl(''),
  });

  // ngOnInit(): void {
  //   this.paginationUsage();
  // }

  searchUsers() {
    console.log('Searching users...');
  }

  // paginationUsage() {
  //   this.paginationService.currentPage = 1;
  //   // this.paginationService.elements = this.users;
  //   this.paginationService.itemsPerPage = 5;
  //   this.paginationService.updateVisibleElements();

  //   this.pages = Array.from(
  //     { length: this.paginationService.numPages() },
  //     (_, i) => i + 1
  //   );
  // }
}
