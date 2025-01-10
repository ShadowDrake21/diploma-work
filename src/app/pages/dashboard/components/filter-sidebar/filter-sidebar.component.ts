import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { projectTags } from '@content/filterProjectTags.content';
import { Filter } from '@shared/types/filters.types';

@Component({
  selector: 'dashboard-filter-sidebar',
  imports: [
    CommonModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.scss',
  providers: [provideNativeDateAdapter()],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterSidebarComponent {
  search = '';
  tags = new FormControl('');

  filterTags = projectTags;
  types: Filter[] = [
    { value: 'patents', viewValue: 'Patents' },
    { value: 'research', viewValue: 'Research' },
    { value: 'development', viewValue: 'Development' },
    { value: 'testing', viewValue: 'Testing' },
  ];
}
