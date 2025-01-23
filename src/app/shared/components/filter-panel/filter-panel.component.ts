import { Component } from '@angular/core';
import { projectTags } from '@content/filterProjectTags.content';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  filterLayout,
  filters,
  quickFilters,
  sorting,
} from '@content/filterPanel.content';

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

  filters = filters;

  sorting = sorting;

  quickFilters = quickFilters;

  filterLayout = filterLayout;
}
