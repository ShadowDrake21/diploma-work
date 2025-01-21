import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { statuses } from '@content/createProject.content';
import { recentProjectContent } from '@content/recentProjects.content';
import { PaginationService } from '@core/services/pagination.service';
import { Filter } from '@shared/types/filters.types';
import { ProfileProjectsComponent } from '@shared/components/profile-projects/profile-projects.component';

@Component({
  selector: 'admin-dashboard-search-content',
  imports: [
    ReactiveFormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ProfileProjectsComponent,
  ],
  templateUrl: './search-content.component.html',
  styleUrl: './search-content.component.scss',
})
export class SearchContentComponent {
  private cdr = inject(ChangeDetectorRef);
  paginationService = inject(PaginationService);
  content = recentProjectContent;
  pages: number[] = [];

  statuses = statuses;
  types: Filter[] = [
    { value: 'publications', viewValue: 'Publications' },
    { value: 'patents', viewValue: 'Patents' },
    { value: 'research', viewValue: 'Research Projects' },
  ];

  contentForm = new FormGroup({
    type: new FormControl(''),
    status: new FormControl(''),
    date: new FormControl(''),
  });

  projects = [...recentProjectContent, ...recentProjectContent];

  searchContent() {
    console.log('Searching users...');
  }

  ngOnInit(): void {
    this.paginationUsage();
    this.cdr.detectChanges();
  }

  paginationUsage() {
    this.paginationService.currentPage = 1;
    this.paginationService.elements = this.content;
    this.paginationService.itemsPerPage = 5;
    this.paginationService.updateVisibleElements();

    this.pages = Array.from(
      { length: this.paginationService.numPages() },
      (_, i) => i + 1
    );
  }
}
