import { Component } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { PaginationService } from '@core/services/pagination.service';
import { SearchUsersComponent } from './components/components/search-users/search-users.component';
import { SearchContentComponent } from './components/components/search-content/search-content.component';

@Component({
  selector: 'admin-dashboard-search-filter',
  imports: [SearchUsersComponent, SearchContentComponent],
  templateUrl: './search-filter.component.html',
  styleUrl: './search-filter.component.scss',
  providers: [provideNativeDateAdapter(), PaginationService],
})
export class SearchFilterComponent {}
