import { Component } from '@angular/core';
import { projectTags } from '../../../../../../content/filterProjectTags.content';
import { Filter } from '../../../../shared/types/filters.types';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'profile-filter-panel',
  imports: [
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonToggleModule,
  ],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss',
})
export class FilterPanelComponent {
  search = '';
  tags = new FormControl('');
  filterTags = projectTags;
  filters: Filter[] = [
    { value: 'patents', viewValue: 'Patents' },
    { value: 'research', viewValue: 'Research' },
    { value: 'development', viewValue: 'Development' },
    { value: 'testing', viewValue: 'Testing' },
  ];

  sorting: Filter[] = [
    { value: 'newest', viewValue: 'Newest to oldest' },
    { value: 'oldest', viewValue: 'Oldest to newest' },
    { value: 'alphabetical', viewValue: 'Alphabetical' },
    { value: 'priority', viewValue: 'Priority' },
  ];

  quickFilters: Filter[] = [
    { value: 'my-projects', viewValue: 'My projects' },
    { value: 'shared-with-me', viewValue: 'Shared with me' },
    { value: 'deadline', viewValue: 'Upcoming deadline' },
  ];

  filterLayout: Filter[] = [
    { value: 'rows', viewValue: 'table_rows' },
    { value: 'grid', viewValue: 'grid_view' },
  ];
}
